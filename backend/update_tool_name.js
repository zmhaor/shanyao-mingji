const sequelize = require('./config/database');
const Tool = require('./models/Tool');

async function updateTool() {
    try {
        await sequelize.authenticate();

        // Find "温病掌中学" and change to "温病掌上学"
        const result = await Tool.update(
            { name: '温病掌上学' },
            { where: { name: '温病掌中学' } }
        );

        console.log(`Updated ${result[0]} rows.`);

        // Find "金匮简易考" icon update if needed
        const jinkuiResult = await Tool.update(
            { icon: '/images/金匮简易考.png' },
            { where: { name: '金匮简易考' } }
        );
        console.log(`Updated Jinkui icon: ${jinkuiResult[0]} rows.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

updateTool();
