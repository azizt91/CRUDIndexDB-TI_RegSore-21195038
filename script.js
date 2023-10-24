const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const nimInput = document.getElementById('nim');
const recordsList = document.getElementById('records');

const dbVersion = 1;
const dbName = 'myDB';
const storeName = 'records';

// Fungsi untuk membuka atau membuat basis data
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Fungsi untuk menambahkan data
function addRecord(data) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const request = store.add(data);
            
            transaction.oncomplete = () => {
                resolve(request.result);
            };
            
            transaction.onerror = () => {
                reject(request.error);
            };
        });
    });
}

// Fungsi untuk membaca semua data
function getAllRecords() {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            transaction.oncomplete = () => {
                resolve(request.result);
            };
            
            transaction.onerror = () => {
                reject(request.error);
            };
        });
    });
}

// Fungsi untuk menghapus data berdasarkan ID
function deleteRecord(id) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const request = store.delete(id);
            
            transaction.oncomplete = () => {
                resolve();
            };
            
            transaction.onerror = () => {
                reject(request.error);
            };
        });
    });
}

// Menampilkan data dalam daftar
function displayRecords() {
    const recordsTable = recordsList;
    recordsTable.innerHTML = '';
    
    getAllRecords().then(records => {
        records.forEach(record => {
            const row = recordsTable.insertRow();
            const nameCell = row.insertCell(0);
            const nimCell = row.insertCell(1);
            const actionCell = row.insertCell(2);
            
            nameCell.textContent = record.name;
            nimCell.textContent = record.nim;

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit';
            editButton.addEventListener('click', () => {
                openEditModal(record); // Panggil fungsi openEditModal saat tombol "Edit" diklik
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete';
            deleteButton.addEventListener('click', () => {
                deleteRecord(record.id).then(() => {
                    displayRecords();
                });
            });
            
            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
        });
    });
}

// Event listener untuk menambahkan data
form.addEventListener('submit', event => {
    event.preventDefault();
    
    const data = {
        name: nameInput.value,
        nim: nimInput.value
    };
    
    addRecord(data).then(() => {
        nameInput.value = '';
        nimInput.value = '';
        displayRecords();
    });
});

// Fungsi untuk membuka modal edit
function openEditModal(record) {
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';

    const editForm = document.getElementById('editForm');
    const editNameInput = document.getElementById('editName');
    const editNIMInput = document.getElementById('editnim');

    editNameInput.value = record.name;
    editNIMInput.value = record.nim;

    editForm.onsubmit = (event) => {
        event.preventDefault();

        const editedData = {
            name: editNameInput.value,
            nim: editNIMInput.value,
            id: record.id
        };

        editRecord(editedData);
        modal.style.display = 'none';
    };

    const closeBtn = document.getElementById('closeBtn');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };
}

function editRecord(data) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const request = store.get(data.id);
            
            request.onsuccess = () => {
                const record = request.result;
                record.name = data.name;
                record.nim = data.nim;
                store.put(record);
            };

            transaction.oncomplete = () => {
                displayRecords();
                resolve();
            };
            
            transaction.onerror = () => {
                reject(request.error);
            };
        });
    });
}


// Tampilkan catatan saat aplikasi dimuat
displayRecords();
