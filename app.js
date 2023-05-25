import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const path = {
    dirData: './data',
    dirContacts: function () {
        return `${this.dirData}/contacts.json`;
    }
}

const writeQuestion = (question) => {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

const manipulateContact = (contacts) => {
    const data = contacts.map((value, index) => {
        return {
            id: index,
            name: value.name,
            email: value.email,
            phone: value.phone
        }
    });

    return data;
}

const createContact = async () => {
    console.log('\n');
    console.log('==================');
    console.log('Tambah Kontak');
    console.log('==================');

    const name = await writeQuestion("Masukkan Nama: ");
    const email = await writeQuestion("Masukkan Email: ");
    const phone = await writeQuestion("Masukkan no HP: ");

    let contact = [{
        name,
        email,
        phone
    }];

    if (!fs.existsSync(path.dirData)) {
        fs.mkdirSync(path.dirData);
    }

    if (fs.existsSync(path.dirContacts())) {

        const file = fs.readFileSync(path.dirContacts(), 'utf-8');
        const contacts = JSON.parse(file);
        contacts.push({
            name,
            email,
            phone
        });

        contact = contacts;
    }

    contact = manipulateContact(contact);

    fs.writeFileSync(path.dirContacts(), JSON.stringify(contact));

    console.log('Terima Kasih sudah memasukkan data.');

    rl.question('\nMasukkan data lagi? (y/n) ', async (answer) => {
        if (answer === 'y') {
            await createContact();
        } else {
            main();
        }
    })
}

const promptMenu = () => {
    return new Promise((resolve, reject) => {
        console.log('\n');
        console.log('==================');
        console.log('Selamat Datang di Aplikasi Catatan Kontak');
        console.log('1. Daftar Kontak');
        console.log('2. Tambah Kontak');
        console.log('3. Ubah Kontak');
        console.log('4. Hapus Kontak');
        console.log('5. Cari Kontak');
        console.log('0. Keluar');
        console.log('==================');
        rl.question('Pilih Menu: ', (menu) => {
            resolve(menu);
        });
    });
}

const showContact = () => {
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
    main();
}

const formUpdateContact = (contact) => {
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
        const name = await writeQuestion("Masukkan Nama Baru: ");
        const email = await writeQuestion("Masukkan Email Baru: ");
        const phone = await writeQuestion("Masukkan no HP Baru: ");

        resolve({
            name,
            email,
            phone
        });
    });
}

const updateContact = () => {
    if (!fs.existsSync(path.dirContacts())) {
        console.log('Daftar Kontak Kosong!');
        main();
    } else {
        console.log('\n');
        rl.question('Masukkan id kontak yang akan diubah: ', async (id) => {
            const file = fs.readFileSync(path.dirContacts(), 'utf-8');
            const contacts = JSON.parse(file);
            const contact = contacts.find((value) => value.id === parseInt(id));

            if (!contact) {
                console.log('Kontak tidak ditemukan!');
                main();
            } else {
                const contactUpdated = await formUpdateContact(contact);

                const contactIndex = contacts.findIndex((value) => value.id === parseInt(id));
                contacts[contactIndex] = {
                    id: parseInt(id),
                    name: contactUpdated.name,
                    email: contactUpdated.email,
                    phone: contactUpdated.phone
                }

                fs.writeFileSync(path.dirContacts(), JSON.stringify(contacts));

                console.log('Kontak berhasil diubah!');

                main();
            }
        });
    }
}

const deleteContact = () => {
    if (!fs.existsSync(path.dirContacts())) {
        console.log('Daftar Kontak Kosong!');
        main();
    } else {
        console.log('\n');
        rl.question('Masukkan id kontak yang akan dihapus: ', async (id) => {
            const file = fs.readFileSync(path.dirContacts(), 'utf-8');
            let contacts = JSON.parse(file);
            const contact = contacts.find((value) => value.id === parseInt(id));

            if (!contact) {
                console.log('Kontak tidak ditemukan!');
                main();
            } else {
                const contactIndex = contacts.findIndex((value) => value.id === parseInt(id));
                contacts.splice(contactIndex, 1);

                contacts = manipulateContact(contacts);

                fs.writeFileSync(path.dirContacts(), JSON.stringify(contacts));

                console.log('Kontak berhasil dihapus!');

                main();
            }
        });
    }
}

const searchContact = () => {
    if (!fs.existsSync(path.dirContacts())) {
        console.log('Daftar Kontak Kosong!');
        main();
    } else {
        console.log('\n');
        rl.question('Masukkan kata kunci: ', async (keyword) => {
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

const main = async () => {

    const menu = await promptMenu();

    switch (menu) {
        case '1':
            showContact();
            break;
        case '2':
            await createContact();
            break;
        case '3':
            updateContact();
            break;
        case '4':
            deleteContact();
            break;
        case '5':
            searchContact();
            break;
        case '0':
            rl.close();
            break;
        default:
            console.log('Menu tidak tersedia!');
            main();
            break;
    }

}

main();