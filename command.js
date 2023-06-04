import yargs from "yargs";
import {
    hideBin
} from 'yargs/helpers'
import {
    Contacts
} from "./contacts.js"


export class Command {
    contacts = () => {
        return new Contacts();
    }

    crudCommand = () => {
        yargs(hideBin(process.argv))
            .command('add', 'Menambah contact baru',
                builder => {
                    builder.option('name', {
                        describe: 'Nama lengkap',
                        demandOption: true,
                        type: 'string'
                    }).option('email', {
                        describe: 'Alamat email',
                        demandOption: false,
                        type: 'string'
                    }).option('phone', {
                        describe: 'Nomor HP',
                        demandOption: true,
                        type: 'string'
                    });
                },
                (argv) => {
                    const data = {
                        name: argv.name,
                        email: argv.email ? argv.email : '',
                        phone: argv.phone
                    };
                    this.contacts().saveContact(data);
                    this.contacts().showContact();
                })
            .command('update', 'Mengubah contact yang sudah ada',
                builder => {
                    builder.option('name', {
                        describe: 'Nama lengkap baru',
                        demandOption: true,
                        type: 'string'
                    }).option('email', {
                        describe: 'Alamat email baru',
                        demandOption: false,
                        type: 'string'
                    }).option('phone', {
                        describe: 'Nomor HP baru',
                        demandOption: true,
                        type: 'string'
                    });
                },
                (argv) => {
                    const data = {
                        name: argv.name,
                        email: argv.email,
                        phone: argv.phone
                    };
                    this.contacts().updateContact(data);
                })
            .command('delete', 'Menghapus contact yang sudah ada',
                builder => {
                    builder.option('id', {
                        describe: 'Id contact',
                        demandOption: true,
                        type: 'number'
                    });
                }, (argv) => {
                    this.contacts().deleteContact(argv.id);
                }
            )
            .command('list', 'Menampilkan semua contact', () => {
                this.contacts().showContact();
            })
            .parse();

    }

}