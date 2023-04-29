import { Composer, Context, Markup, Scenes, session, Telegraf } from "telegraf";
import axios from "axios";

interface MyWizardSession extends Scenes.WizardSessionData {
    fio: string;
    aboutme: string;
    mytelegram: string | number;
    age: string;
    feedback: string;
    posttext: string;
    title: string;
}
interface MyContext extends Context {
    myContextProp: string;
    scene: Scenes.SceneContextScene<MyContext, MyWizardSession>;
    wizard: Scenes.WizardContextWizard<MyContext>;
}

let isButtonPressed = false;

const bot = new Telegraf<MyContext>("6244990712:AAGDffDFIb3tfdYXR1PFxD7K9T4lwH2n6IM");

bot.use(session());
bot.use((ctx, next) => {
    const now = new Date();
    ctx.myContextProp = now.toString();
    return next();
});


bot.start(async (ctx) => {
    ctx.reply( `Привет`, Markup
        .inlineKeyboard([
            [Markup.button.callback('тест','TEST')]])
    )

    axios.get(`http://localhost:8080/api/user/${ctx.message.from.id}`)
        .then(async res =>{
            if ( res.data.length === 0 ) {


                await axios.post(`http://localhost:8080/api/user`, { "telegramid": ctx.message.from.id, "username": ctx.message.from.first_name})
                    .then(res =>{
                         ctx.reply( `Привет, ${res.data.username}!`, Markup
                            .inlineKeyboard([
                                [Markup.button.callback('подать заявку','invite')],
                                [Markup.button.callback('⬅️ Назад', 'back_menu')]])
                        )
                    })}
            else {
                ctx.reply(`привет, комманды - /menu`)
            }

            })
        .catch(error =>{
            console.error(error)
        })
})
bot.action('TEST', (ctx, next) => {
    if (!isButtonPressed) {
        isButtonPressed = true;
        // выполнение функции
        ctx.reply("функция")
            .then(() => {
                isButtonPressed = false;
            })
            .catch((error) => {
                console.error(error);
                isButtonPressed = false;
            });
    }
});
bot.command('menu', (ctx, next) => {
    axios.get(`http://localhost:8080/api/user/${ctx.from.id}`)
        .then(res => {
            ctx.replyWithHTML(`
    Аккаунт: ${ctx.from.username}
Роль: ${res.data.role}
    `, Markup.inlineKeyboard(
                [
                    [Markup.button.callback('Предложить пост', 'postt')]
                ]
            ))
        })

});

const stepHandler = new Composer<MyContext>();
const startHandler = new Composer<MyContext>();

const ageHandler = new Composer<MyContext>();
const myfioHandler = new Composer<MyContext>();
const aboutmeHandler = new Composer<MyContext>();
const telegramHandler = new Composer<MyContext>();

const feedbackHandler = new Composer<MyContext>();

const titleHandler = new Composer<MyContext>();
const textHandler = new Composer<MyContext>();

const objectData = new Composer<MyContext>();
const linkData = new Composer<MyContext>();

stepHandler.use( async ctx => {
    await ctx.reply("Введите ФИО:");
    return ctx.wizard.next();
});

myfioHandler.on('text', async (ctx) =>{
    await ctx.replyWithHTML(`ФИО: <b>${ctx.message.text}</b>`)
    ctx.scene.session.fio = ctx.message.text
    await ctx.reply(`введите свой возраст`)
    return ctx.wizard.next();
})
ageHandler.on('text', async (ctx) =>{
    await ctx.replyWithHTML(`возраст: <b>${ctx.message.text}</b>`)
    ctx.scene.session.age = ctx.message.text
    await ctx.reply(`расскажите о себе`)
    return ctx.wizard.next();
})
aboutmeHandler.on('text', async (ctx) =>{
    await ctx.reply(`ваша заявка отправлена на рассмотрение`)
    await axios.post('https://api.telegram.org/bot6244990712:AAGDffDFIb3tfdYXR1PFxD7K9T4lwH2n6IM/sendMessage',
        {
            "chat_id": "969061448",
            "parse_mode": "HTML",
            "text": `
<b>новая заявка: @${ctx.from.username}</b>
<b>ФИО: ${ctx.scene.session.fio}</b>
<b>возраст: ${ctx.scene.session.age}</b>
<b>о себе: ${ctx.message.text}</b>
`,
            "reply_markup":
                {
                    inline_keyboard: [
                        [{ text: '❌ отказать', callback_data: `denyApli ${ctx.from.id}` },{ text: '✅ принять', callback_data: `acceptApli ${ctx.from.id}` }],
                    ],
                }
        })
    await axios.post('http://localhost:8080/api/application',
        {
            "telegramid": ctx.message.from.id,
            "fio": ctx.scene.session.fio,
            "age": ctx.scene.session.age,
            "aboutme": ctx.scene.session.aboutme
        })
    return ctx.scene.leave()
})







startHandler.use( async ctx => {
    await ctx.reply("тема поста:");
    return ctx.wizard.next();
});
titleHandler.on(`text`, async ctx => {
    await ctx.reply("текст поста:");
    ctx.scene.session.title = ctx.message.text
    return ctx.wizard.next();
});

textHandler.on(`text`, async ctx => {
    await ctx.reply("пост отправлен на рассмотрение, спасибо!");
    ctx.scene.session.posttext = ctx.message.text
    axios.post('https://api.telegram.org/bot6244990712:AAGDffDFIb3tfdYXR1PFxD7K9T4lwH2n6IM/sendMessage',
        {
            "chat_id": "969061448",
            "parse_mode": "HTML",
            "text": `
<b>предложка: @${ctx.from.username}</b>
<b>тема поста: ${ctx.scene.session.title}</b>
<b>текст поста: ${ctx.scene.session.posttext}</b>
`})
});







const invite = new Scenes.WizardScene("invite", stepHandler, myfioHandler, ageHandler, aboutmeHandler, telegramHandler);
const newpost = new Scenes.WizardScene("post", startHandler, titleHandler, textHandler);

const stage = new Scenes.Stage<MyContext>([invite, newpost ]);
bot.use(stage.middleware())
bot.action("invite", (ctx) => {ctx.scene.enter('invite'); console.log(1)})
bot.action("postt", (ctx) => {ctx.scene.enter('post'); console.log(1)})


bot.launch();

