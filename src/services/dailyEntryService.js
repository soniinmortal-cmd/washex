const { Op } = require("sequelize");
const Sequelize = require('../config/sequelize');
const { DailyEntry, ElectricityLogs, GasLogs, AdminMisConfig, LpgLogs, Washer} = require("../models");
const { LpgReceipts } = require("../models/lpgReceipts.model");

const addEntry=async(data,t)=>{
    const washerId = data.washerId;
    const date = data.date;
    const totalLoadKg = data.totalLoadKg;

    if(!washerId || !date || !totalLoadKg){
        throw new Error("inputs missing");
    }

    if(totalLoadKg <= 0){
        throw new Error("invalid load");
    }

    const hasElectricity = data.electricity && Object.keys(data.electricity).length > 0;
    const hasGas = data.gas && Object.keys(data.gas).length > 0;
    const hasLpg =data.lpg && Object.keys(data.lpg).length > 0;

    if(!hasElectricity && !hasGas && !hasLpg){
        throw new Error("no data provided");
    }

    let entry = await DailyEntry.findOne({
        where:{
            washerId,
            date
        },
        transaction : t
    })

    if(entry){
        await entry.update({
            totalLoadKg
        }, { transaction: t });
    }else{
        entry = await DailyEntry.create({
            washerId,
            date,
            totalLoadKg
        }, { transaction: t });
    }

    const configs = await AdminMisConfig.findAll({
        where:{
            washerId:washerId
        },
        transaction:t
    });


    const configMap = {};
    configs.forEach(c => configMap[c.type] = Number(c.value));

    if (
        configMap['ELECTRICITY_PRICE'] == null ||
        configMap['ELECTRICITY_MF'] == null ||
        configMap['GAS_PRICE'] == null ||
        configMap['GAS_MF'] == null ||
        configMap['LPG_PRICE'] == null ||
        configMap['LPG_MF'] == null
    ) {
        throw new Error("washer config missing");
    }

    if(hasElectricity){
        if(data.electricity.closing==null || data.electricity.opening==null){
            throw new Error("electricty inputs missing");
        }

        if(data.electricity.closing < data.electricity.opening){
            throw new Error("Closing reading cannot be less than opening reading");
			
        }

        const consumedUnits = data.electricity.closing-data.electricity.opening;
        const mfUsed = configMap['ELECTRICITY_MF'];
        const pricePerUnitAtTime = configMap['ELECTRICITY_PRICE'];
        const cost = Number(
            (
                consumedUnits *
                mfUsed *
                pricePerUnitAtTime
            ).toFixed(3)
        );

        await ElectricityLogs.upsert({
            entryId:entry.id,
            opening:data.electricity.opening,
            closing:data.electricity.closing,
            consumedUnits,
            mfUsed,
            pricePerUnitAtTime,
            cost
        },{transaction : t});
    }

    if(hasGas){
        if(data.gas.closing==null || data.gas.opening==null){
            throw new Error("gas inputs missing");
        }

        const consumedUnits = Math.abs(data.gas.closing-data.gas.opening);

        const mfUsed = configMap['GAS_MF'];
        const consumedUnitsinKg=Number((consumedUnits * mfUsed).toFixed(3))
        const pricePerKgAtTime = configMap['GAS_PRICE'];
        const cost = Number((consumedUnitsinKg * pricePerKgAtTime).toFixed(3));

        await GasLogs.upsert({
            entryId:entry.id,
            opening:data.gas.opening,
            closing:data.gas.closing,
            consumedUnits,
            consumedUnitsinKg,
            mfUsed,
            pricePerKgAtTime,
            cost
        },{transaction : t})

    }

    if (hasLpg) {

        if (
            data.lpg.closing == null ||
            data.lpg.opening == null
        ) {
            throw new Error("lpg inputs missing");
        }

        if (
            data.lpg.opening < data.lpg.closing
        ) {
            throw new Error(
                "Opening reading cannot be less than closing reading"
            );
        }

        const consumedUnits =
            Number(data.lpg.opening) -
            Number(data.lpg.closing);

        const mfUsed =
            configMap['LPG_MF'];

        const pricePerUnitAtTime =
            configMap['LPG_PRICE'];

        const cost = Number(
            (
                consumedUnits *
                mfUsed *
                pricePerUnitAtTime
            ).toFixed(3)
        );

        await LpgLogs.upsert({
            entryId: entry.id,
            opening: data.lpg.opening,
            closing: data.lpg.closing,
            consumedUnits,
            mfUsed,
            pricePerUnitAtTime,
            cost
        }, {
            transaction: t
        });
    }

    return;
};

const show = async(month,year,washerId)=>{
    if(!month || !year){
        throw new Error("month and year expected");
    }

    if(typeof month !== 'number'){
        throw new Error('incorrect type')
    }

    if(typeof year !== 'number'){
        throw new Error('incorrect type')
    }

    if (
        washerId !== undefined &&
        washerId !== null &&
        typeof washerId !== 'number'
    ) {
        throw new Error('incorrect washerId type');

        const washer = await Washer.findOne({
            where: {
                id: washerId
            }
        });

        if (!washer) {
            throw new Error('washer not found');
        }
    }

    const formattedMonth = String(month).padStart(2, '0');

    const startDate = `${year}-${formattedMonth}-01`;
    const endDate = new Date(year, month, 0)
        .toISOString()
        .split('T')[0];

    const dailyEntryWhere = {
        date: {
            [Op.between]: [startDate, endDate]
        }
    };

    if (washerId !== undefined && washerId !== null) {
        dailyEntryWhere.washerId = washerId;
    }

    const data = await DailyEntry.findAll({
        where:dailyEntryWhere,
        include:[{
            model : ElectricityLogs,
            attributes : [],
            required : false
        },{
            model : GasLogs,
            attributes : [],
            required : false
        },{
            model: LpgLogs,
            attributes: [],
            required: false
        }],
        attributes:[
            'date',

            [Sequelize.fn('SUM', Sequelize.col('totalLoadKg')), 'totalLoad'],

            [Sequelize.fn('SUM', Sequelize.col('ElectricityLog.opening')),'electricityOpening'],
            [Sequelize.fn('SUM', Sequelize.col('ElectricityLog.closing')),'electricityClosing'],
            [Sequelize.fn('SUM', Sequelize.col('ElectricityLog.consumedUnits')),'electricityUnits'],
            [Sequelize.fn('SUM',Sequelize.col('ElectricityLog.cost')),'electricityCost'],

            [Sequelize.fn('SUM', Sequelize.col('GasLog.opening')),'gasOpening'],
            [Sequelize.fn('SUM', Sequelize.col('GasLog.closing')),'gasClosing'],
            [Sequelize.fn('SUM', Sequelize.col('GasLog.consumedUnits')),'gasUnits'],
            [Sequelize.fn('SUM', Sequelize.col('GasLog.consumedUnitsinKg')),'gasUnitsInKg'],
            [Sequelize.fn('SUM',Sequelize.col('GasLog.cost')),'gasCost'],

            [Sequelize.fn(
                'SUM',
                Sequelize.col('LpgLog.opening')
            ), 'lpgOpening'],

            [Sequelize.fn(
                'SUM',
                Sequelize.col('LpgLog.closing')
            ), 'lpgClosing'],

            [Sequelize.fn(
                'SUM',
                Sequelize.col('LpgLog.consumedUnits')
            ), 'lpgUnits'],

            [Sequelize.fn(
                'SUM',
                Sequelize.col('LpgLog.cost')
            ), 'lpgCost']
        ],
        group:['date'],
        order:[['date','DESC']]
    })

    const washerData = await DailyEntry.findAll({
        where:dailyEntryWhere,

        include:[{
            model:ElectricityLogs,
            attributes:[],
            required:false
        },{
            model:GasLogs,
            attributes:[],
            required:false
        }, {
            model: LpgLogs,
            attributes: [],
            required: false
        }],

        attributes:[
            'date',
            'washerId',

            [Sequelize.fn('SUM', Sequelize.col('totalLoadKg')), 'totalLoad'],

            [Sequelize.fn('SUM', Sequelize.col('ElectricityLog.consumedUnits')), 'electricityUnits'],
            [Sequelize.fn('SUM', Sequelize.col('ElectricityLog.cost')), 'electricityCost'],

            [Sequelize.fn('SUM', Sequelize.col('GasLog.consumedUnitsinKg')), 'gasUnitsInKg'],
            [Sequelize.fn('SUM', Sequelize.col('GasLog.cost')), 'gasCost'],

            [Sequelize.fn(
                'SUM',
                Sequelize.col('LpgLog.consumedUnits')
            ), 'lpgUnits'],

            [Sequelize.fn(
                'SUM',
                Sequelize.col('LpgLog.cost')
            ), 'lpgCost'],
        ],

        group:['date','washerId'],

        raw:true
    });

    const washerMap = washerData.reduce((acc,row)=>{

        if(!acc[row.date]){
            acc[row.date]=[];
        }

        const totalLoad = Number(row.totalLoad) || 0;

        const electricityUnits = Number(row.electricityUnits) || 0;
        const electricityCost = Number(row.electricityCost) || 0;

        const gasUnitsInKg = Number(row.gasUnitsInKg) || 0;
        const gasCost = Number(row.gasCost) || 0;

        const lpgUnits =
            Number(row.lpgUnits) || 0;

        const lpgCost =
            Number(row.lpgCost) || 0;

        acc[row.date].push({

            washerId : row.washerId,

            totalLoadKg : Number(totalLoad.toFixed(3)),

            electricity : electricityUnits || electricityCost ? {

                consumedUnits : electricityUnits,

                unitPerKg : totalLoad
                    ? Number((electricityUnits/totalLoad).toFixed(3))
                    : null,

                costPerKg : totalLoad
                    ? Number((electricityCost/totalLoad).toFixed(3))
                    : null

            } : null,

            gas : gasUnitsInKg || gasCost ? {

                consumedUnitsInKg : gasUnitsInKg,

                perKgLoad : totalLoad
                    ? Number((gasUnitsInKg/totalLoad).toFixed(3))
                    : null,

                costPerKg : totalLoad
                    ? Number((gasCost/totalLoad).toFixed(3))
                    : null

            } : null,

            lpg: lpgUnits || lpgCost ? {

                consumedUnits: lpgUnits,

                unitPerKg: totalLoad
                    ? Number(
                        (lpgUnits / totalLoad).toFixed(3)
                    )
                    : null,

                costPerKg: totalLoad
                    ? Number(
                        (lpgCost / totalLoad).toFixed(3)
                    )
                    : null

            } : null,

            costing : {

                totalCost : Number((electricityCost+gasCost+lpgCost).toFixed(3)),

                gasAndEperKgCost : totalLoad
                    ? Number(((electricityCost+gasCost+lpgCost)/totalLoad).toFixed(3))
                    : null
            }
        });

        return acc;

    },{});


    const formattedData = data.map(row =>{

        const totalLoad = Number(row.get('totalLoad')) || 0;

        const electricityOpening = Number(row.get('electricityOpening')) || 0;
        const electricityClosing = Number(row.get('electricityClosing')) || 0;
        const electricityUnits = Number(row.get('electricityUnits')) || 0;
        const electricityCost = Number(row.get('electricityCost')) || 0;
        const electricityPricePerUnit = electricityUnits? Number((electricityCost/electricityUnits).toFixed(3)) : null;

        const gasOpening = Number(row.get('gasOpening')) || 0;
        const gasClosing = Number(row.get('gasClosing')) || 0;
        const gasUnits = Number(row.get('gasUnits')) || 0;
        const gasUnitsInKg = Number(row.get('gasUnitsInKg')) || 0;
        const gasCost = Number(row.get('gasCost')) || 0;

        const lpgOpening =
            Number(row.get('lpgOpening')) || 0;

        const lpgClosing =
            Number(row.get('lpgClosing')) || 0;

        const lpgUnits =
            Number(row.get('lpgUnits')) || 0;

        const lpgCost =
            Number(row.get('lpgCost')) || 0;

        const hasElectricity = electricityUnits>0 || electricityCost>0;
        const hasGas = gasUnits>0 || gasCost>0;

        const hasLpg =
            lpgUnits > 0 ||
            lpgCost > 0;

        return {
            date : row.date,
            washers : washerMap[row.date] || [],
            totalLoadKg : totalLoad,

            electricity: hasElectricity? {
                opening : electricityOpening,
                closing : electricityClosing,
                consumedUnits : electricityUnits,
                pricePerUnit : electricityPricePerUnit,
                totalCost : electricityCost,
                unitPerKg : totalLoad?Number((electricityUnits/totalLoad).toFixed(3)):null,
                costPerKg : totalLoad?Number((electricityCost/totalLoad).toFixed(3)):null
            } : null,

            gas: hasGas?  {
                opening : gasOpening,
                closing : gasClosing,
                consumedUnits : gasUnits,
                consumedUnitsInKg : gasUnitsInKg,
                totalCost : gasCost,
                perKgLoad : totalLoad?Number((gasUnitsInKg/totalLoad).toFixed(3)):null,
                costPerKg :totalLoad? Number((gasCost/totalLoad).toFixed(3)):null
            } : null,

            lpg: hasLpg ? {

                opening: lpgOpening,

                closing: lpgClosing,

                consumedUnits: lpgUnits,

                totalCost: lpgCost,

                unitPerKg: totalLoad
                    ? Number(
                        (lpgUnits / totalLoad).toFixed(3)
                    )
                    : null,

                costPerKg: totalLoad
                    ? Number(
                        (lpgCost / totalLoad).toFixed(3)
                    )
                    : null

            } : null,

            costing:{
                totalCost : Number((electricityCost+gasCost+lpgCost).toFixed(3)),
                gasAndEperKgCost : totalLoad? Number(((electricityCost+gasCost+lpgCost)/totalLoad).toFixed(3)):null
            }
        }
    })

    return formattedData;

};

const getTotalLoad=async(month,year)=>{
    if(!month){
        throw new Error("month required");
    }

    if(!year){
        throw new Error("month required");
    }

    const startDate = `${year}-${month}-01`;
    const endDate = new Date(year, month, 0)
        .toISOString()
        .split('T')[0];

    const data = await DailyEntry.findAll({
        where: {
            date: {
                [Op.between]: [startDate, endDate]
            }
        },
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('totalLoadKg')), 'totalLoad']
        ]
    });

    return Number(data[0].get('totalLoad')) || 0;
}

const lastDaysOpening = async (washerId, date) => {

    if (!washerId) {
        throw new Error("washer id required");
    }

    if (!date) {
        throw new Error("date required");
    }

    const existingElectricity = await DailyEntry.findOne({
        where: {
            washerId,
            date
        },
        include: [{
            model: ElectricityLogs,
            attributes: ['opening', 'closing'],
            required: true
        }]
    });

    const existingGas = await DailyEntry.findOne({
        where: {
            washerId,
            date
        },
        include: [{
            model: GasLogs,
            attributes: ['opening', 'closing'],
            required: true
        }]
    });

    const existingLpg = await DailyEntry.findOne({
        where: {
            washerId,
            date
        },
        include: [{
            model: LpgLogs,
            attributes: ['opening', 'closing'],
            required: true
        }]
    });

    if (existingElectricity || existingGas || existingLpg) {

        return {
            exists: true,
            totalLoad:
                existingElectricity?.totalLoadKg ||
                existingGas?.totalLoadKg ||
                existingLpg?.totalLoadKg ||
                null,
            electricity: existingElectricity
                ? {
                    opening: existingElectricity.ElectricityLog.opening,
                    closing: existingElectricity.ElectricityLog.closing
                }
                : null,

            gas: existingGas
                ? {
                    opening: existingGas.GasLog.opening,
                    closing: existingGas.GasLog.closing
                }
                : null,
            
            lpg: existingLpg
            ? {
                opening: existingLpg.LpgLog.opening,
                closing: existingLpg.LpgLog.closing
            }
            : null
        };
    }


    const electricity = await DailyEntry.findOne({
        where: {
            washerId,
            date: {
                [Op.lt]: date
            }
        },
        include: [{
            model: ElectricityLogs,
            attributes: ['closing'],
            required: true
        }],
        order: [['date', 'DESC']]
    });


    const gas = await DailyEntry.findOne({
        where: {
            washerId,
            date: {
                [Op.lt]: date
            }
        },
        include: [{
            model: GasLogs,
            attributes: ['closing'],
            required: true
        }],
        order: [['date', 'DESC']]
    });

    const lpg = await DailyEntry.findOne({
        where: {
            washerId,
            date: {
                [Op.lt]: date
            }
        },
        include: [{
            model: LpgLogs,
            attributes: ['closing'],
            required: true
        }],
        order: [['date', 'DESC']]
    });

    const lpgReceipts = await LpgReceipts.findAll({
        where: {
            washerId,
            date
        },
        attributes: ['quantity']
    });

    const totalLpgReceived = lpgReceipts.reduce(
        (sum, receipt) => {
            return sum + Number(receipt.quantity);
        },
        0
    );

    const lpgOpening = lpg
    ? Number(lpg.LpgLog.closing) + totalLpgReceived
    : totalLpgReceived;

    return {
        exists: false,
        totalLoad:null,
        electricity: {
            opening: electricity?.ElectricityLog?.closing || null,
            closing: null
        },

        gas: {
            opening: gas?.GasLog?.closing || null,
            closing: null
        },

        lpg: {
            opening: lpgOpening || null,
            closing: null
        }
    };
};

module.exports={
    addEntry,
    show,
    getTotalLoad,
    lastDaysOpening
}