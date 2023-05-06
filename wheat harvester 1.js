const { debug } = require('console')
const mineflayer = require('mineflayer');
const { nextTick } = require('process');

bot = mineflayer.createBot({
    host: 'thomtestbot.omgcraft.fr',
    port: 10003,
    version: "1.8.9",
    auth: 'microsoft',
    username: 'openclassroomthom@gmail.com',
    password: 'rieg020220050202'
})

let mcData;
mcData = require('minecraft-data')(bot.version);
const vec3 = require('vec3');

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  } 


function reconnect()
{
    bot = mineflayer.createBot({
        host: 'thomtestbot.omgcraft.fr',
        port: 10003,
        version: "1.8.9",
        auth: 'microsoft',
        username: 'openclassroomthom@gmail.com',
        password: 'rieg020220050202'
    })
}

function sayHello()
{
    bot.chat('hello')
    bot.setQuickBarSlot(0)
}

async function pathfinder(z, x)
{
  bot.look(3.14159265359, -3.14159265359/2 , true) //regarde vers le sud pour permettre les déplacements
  while (!(bot.entity.position.z > z - 0.4 && bot.entity.position.z < z + 0.4 && bot.entity.position.x > x - 0.4 && bot.entity.position.x < x + 0.4)) {
    await console.log("je vais vers le blé " + z + x);
    bot.setControlState('forward', true);
    while (bot.entity.position.z < z - 0.4) {
      await delay(5);
    }
    bot.setControlState('forward', false);
    bot.setControlState('back', true);
    while (bot.entity.position.z > z + 0.4) {
      await delay(5);
    }
    bot.setControlState('back', false);
    bot.setControlState('left', true);
    while (bot.entity.position.x < x - 0.4) {
      await delay(5);
    }
    bot.setControlState('left', false);
    bot.setControlState('right', true);
    while (bot.entity.position.x > x + 0.4) {
      await delay(5);
    }
    bot.setControlState('right', false);
  }
}

async function pickUp(idItem)
{
  while (true) {
    let seedDrop = null;
    itemDrop = bot.nearestEntity(entity => {
      return (entity.entityType == 45
        && entity.metadata['8'].itemId == idItem);
    });
    if (itemDrop === null) break;
    pathfinder(itemDrop.z, itemDrop.x)
  }
}

async function farm()
{
    bot.chat('je vais chercher la ferme')
    await bot.setQuickBarSlot(3)
    const wheatID = mcData.blocksByName['wheat'].id;
    const seedID = mcData.itemsByName['wheat_seeds'].id;
    const blocsAcasser = bot.findBlocks({
        matching: (block) => {return block.type == wheatID && block.metadata == 7},//on verifie que le bloc de ble est mature
        maxDistance: 32,
        count: 1000
      })
    console.log(blocsAcasser)


    for (const element of blocsAcasser) {
        await pathfinder(element.z, element.x);

        await bot.dig(bot.blockAt(element), true).catch(err => {console.log(err)}) 
        console.log('blé cassé:' + element);

        bot.waitForTicks(20);
        await pickUp(seedID);
        bot.waitForTicks(1);
        await pickUp(wheatID);

        bot.waitForTicks(5);
        await bot.equip(seedID);
        bot.waitForTicks(5);
        let dirtBlock = element;
        dirtBlock.y = dirtBlock.y - 1;
        await bot.placeBlock(bot.blockAt(dirtBlock), vec3(0, 1, 0)).catch(err => {console.log(err)}) 
        bot.waitForTicks(10);
        console.log('blé planté:' + element);

        await delay(250);
    }
}



    bot.on('end', reconnect)
    bot.on('spawn', sayHello)

    bot.on('chat', (username, message) => {
        const regex = /farm/;
      
        const match = message.match(regex);
      
        if (match) {
          bot.chat(`Oui chef `+username+ '!');
          farm()
        }
        
      });

