import {
    Contacts
} from './contacts.js';
import {
    Command
} from './command.js';

let main;

if (process.argv.length > 2) {
    const command = new Command();
    command.crudCommand();

} else {
    const contacts = new Contacts();

    main = async () => {
        const menu = await contacts.promptMenu();

        switch (menu) {
            case '1':
                contacts.showContact();
                break;
            case '2':
                contacts.createContact();
                break;
            case '3':
                contacts.updateContact();
                break;
            case '4':
                contacts.deleteContact();
                break;
            case '5':
                contacts.searchContact();
                break;
            case '6':
                contacts.usingCommandLineArguments();
                break;
            case '0':
                contacts.rl.close();
                break;
            default:
                console.log('Menu tidak tersedia!');
                main();
                break;
        }
    };

    main();
}

export {
    main
};