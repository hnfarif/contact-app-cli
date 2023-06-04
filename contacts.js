import fs from 'fs';
import readline from 'readline';
import chalk from 'chalk';
import validator from 'validator';
import {
    main
} from './app.js';
import {
    path
} from './path.js';

export class Contacts {

    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    writeQuestion = (question) => {
        return new Promise((resolve, reject) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    validation = (file, input) => {
        const duplicate = file.find((contact) => contact.name === input.name);
        if (duplicate) {
            console.log(chalk.red.inverse.bold('Kontak sudah terdaftar, silahkan gunakan nama lain!'));
            return false;
        }

        if (!input.name) {
            console.log(chalk.red.inverse.bold('Nama harus diisi!'));
            return false;
        }

        if (!input.phone) {
            console.log(chalk.red.inverse.bold('No HP harus diisi!'));
            return false;
        }

        if (input.email) {
            if (!validator.isEmail(input.email)) {
                console.log(chalk.red.inverse.bold('Email tidak valid!'));
                return false;
            }
        }

        if (!validator.isMobilePhone(input.phone, 'id-ID')) {
            console.log(chalk.red.inverse.bold('No HP tidak valid!'));
            return false;
        }

        return true;
    }

    manipulateContact = (contacts) => {
        const data = contacts.map((value, index) => {
            return {
                id: index,
                name: value.name,
                email: value.email ? value.email : '',
                phone: value.phone
            }
        });

        return data;
    }

    createQuestion = async () => {
        console.log('\n');
        console.log('==================');
        console.log('Tambah Kontak');
        console.log('==================');

        const name = await this.writeQuestion("Masukkan Nama: ");
        const email = await this.writeQuestion("Masukkan Email: ");
        const phone = await this.writeQuestion("Masukkan no HP: ");

        return {
            name,
            email,
            phone
        }
    }

    saveContact = (data) => {
        let contact = [data];

        if (!fs.existsSync(path.dirData)) {
            fs.mkdirSync(path.dirData);
        }

        if (fs.existsSync(path.dirContacts())) {

            const file = fs.readFileSync(path.dirContacts(), 'utf-8');
            const contacts = JSON.parse(file);
            const validate = this.validation(contacts, data);

            if (!validate) {
                if (process.argv.length > 2) {
                    return false;
                }
                return main();
            }

            contacts.push(data);

            contact = contacts;
        }


        contact = this.manipulateContact(contact);

        fs.writeFileSync(path.dirContacts(), JSON.stringify(contact));

        console.log(chalk.green.inverse.bold('Kontak berhasil disimpan!'));

        if (process.argv.length > 2) {
            return;
        } else {
            this.rl.question('\nMasukkan data lagi? (y/n) ', (answer) => {
                if (answer === 'y') {
                    this.createContact();
                } else {
                    main();
                }
            })
        }
    }

    createContact = () => {
        this.createQuestion().then((data) => {
            this.saveContact(data);
        });
    }

    promptMenu = () => {
        return new Promise((resolve, reject) => {
            console.log('\n');
            console.log('==================');
            console.log('Selamat Datang di Aplikasi Catatan Kontak');
            console.log('1. Daftar Kontak');
            console.log('2. Tambah Kontak');
            console.log('3. Ubah Kontak');
            console.log('4. Hapus Kontak');
            console.log('5. Cari Kontak');
            console.log('6. Pro Tips! (menggunakan command line arguments)');
            console.log('0. Keluar');
            console.log('==================');
            this.rl.question('Pilih Menu: ', (menu) => {
                resolve(menu);
            });
        });
    }

    showContact = () => {
        if (fs.existsSync(path.dirContacts())) {
            const file = fs.readFileSync(path.dirContacts(), 'utf-8');
            const contacts = JSON.parse(file);
            console.log('\n');
            console.table(contacts.map((value, index) => {
                return {
                    id: value.id,
                    name: value.name,
                    email: value.email,
                    phone: value.phone
                }
            }));
        } else {
            console.log('Kontak Kosong!');
        }

        console.log('==================');

        if (process.argv.length > 2) {
            this.rl.close();
        } else {
            main();
        }
    }

    formUpdateContact = (contact) => {
        return new Promise(async (resolve, reject) => {
            console.log('\n');
            console.log('=======================');
            console.log('Kontak ditemukan!');
            console.log('=======================');
            console.log(`Nama: ${contact.name}`);
            console.log(`Email: ${contact.email}`);
            console.log(`No HP: ${contact.phone}`);
            console.log('=======================');
            console.log('\n');
            console.log('Masukkan data baru untuk mengubah kontak');
            console.log('==========================================');
            const name = await this.writeQuestion("Masukkan Nama Baru: ");
            const email = await this.writeQuestion("Masukkan Email Baru: ");
            const phone = await this.writeQuestion("Masukkan no HP Baru: ");

            resolve({
                name,
                email,
                phone
            });
        });
    }

    updateContact = (data) => {
        if (!fs.existsSync(path.dirContacts())) {
            console.log('Daftar Kontak Kosong!');
            main();
        } else {
            console.log('\n');
            this.rl.question('Masukkan id kontak yang akan diubah: ', async (id) => {
                const file = fs.readFileSync(path.dirContacts(), 'utf-8');
                const contacts = JSON.parse(file);
                const contact = contacts.find((value) => value.id === parseInt(id));

                if (!contact) {
                    console.log('Kontak tidak ditemukan!');
                    main();
                } else {
                    const contactUpdated = (data) ? data : await this.formUpdateContact(contact);

                    const contactIndex = contacts.findIndex((value) => value.id === parseInt(id));
                    contacts[contactIndex] = {
                        id: parseInt(id),
                        name: contactUpdated.name,
                        email: contactUpdated.email,
                        phone: contactUpdated.phone
                    }

                    fs.writeFileSync(path.dirContacts(), JSON.stringify(contacts));

                    console.log('Kontak berhasil diubah!');
                    if (process.argv.length > 2) {
                        this.rl.close();
                    } else {
                        main();
                    }
                }
            });
        }
    }

    deleteContact = (idContact) => {
        if (!fs.existsSync(path.dirContacts())) {
            console.log('Daftar Kontak Kosong!');
            main();
        } else {
            console.log('\n');

            const file = fs.readFileSync(path.dirContacts(), 'utf-8');
            let contacts = JSON.parse(file);

            if (idContact) {
                const contact = contacts.find((value) => value.id === parseInt(idContact));
                if (!contact) {
                    console.log('Kontak tidak ditemukan!');
                    this.rl.close();
                } else {
                    const contactIndex = contacts.findIndex((value) => value.id === parseInt(idContact));
                    contacts.splice(contactIndex, 1);

                    contacts = this.manipulateContact(contacts);

                    fs.writeFileSync(path.dirContacts(), JSON.stringify(contacts));

                    console.log('Kontak berhasil dihapus!');
                    this.rl.close();
                }
            } else {
                this.rl.question('Masukkan id kontak yang akan dihapus: ', async (id) => {

                    const contact = contacts.find((value) => value.id === parseInt(id));
                    if (!contact) {
                        console.log('Kontak tidak ditemukan!');
                        main();
                    } else {
                        const contactIndex = contacts.findIndex((value) => value.id === parseInt(id));
                        contacts.splice(contactIndex, 1);

                        contacts = this.manipulateContact(contacts);

                        fs.writeFileSync(path.dirContacts(), JSON.stringify(contacts));

                        console.log('Kontak berhasil dihapus!');
                        main();
                    }
                });
            }

        }
    }

    searchContact = () => {
        if (!fs.existsSync(path.dirContacts())) {
            console.log('Daftar Kontak Kosong!');
            main();
        } else {
            console.log('\n');
            this.rl.question('Masukkan kata kunci (nama/email/no. Hp): ', async (keyword) => {
                const file = fs.readFileSync(path.dirContacts(), 'utf-8');
                const contacts = JSON.parse(file);
                const contact = contacts.filter((value) => {
                    return value.name.toLowerCase().includes(keyword.toLowerCase()) || value.phone.includes(keyword) || value.email.toLowerCase().includes(keyword.toLowerCase());
                });

                if (contact.length === 0) {
                    console.log('Kontak tidak ditemukan!');
                    main();
                } else {
                    console.log('\n');
                    console.log('kontak ditemukan!');
                    console.table(contact)
                    main();
                }
            });
        }
    }

    usingCommandLineArguments = () => {
        console.log('\n');
        console.log('============================================');
        console.log('Pro Tips! menggunakan command line arguments');
        console.log('Anda dapat menggunakan command line arguments untuk menambahkan, mengubah, dan menghapus kontak');
        console.log("Jalankan perintah 'node app --help' untuk melihat detail commandnya");
        this.rl.close();
    }

}