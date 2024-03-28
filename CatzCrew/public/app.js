document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    const db = firebase.firestore();

    const ingredients = db.collection('ingredients');

    ingredients.get().then((querySnapshot) => {
        const tableBody = document.getElementById('ingredientsTable').getElementsByTagName('tbody')[0];

        querySnapshot.forEach((doc) => {
            const productData = doc.data();

            // Create a new row and cells
            let row = document.createElement('tr');
            let nameCell = document.createElement('td');
            let quantityCell = document.createElement('td');

            // Set the text of the cells
            nameCell.textContent = productData.name;
            quantityCell.textContent = productData.quantity;

            // Add the cells to the row
            row.appendChild(nameCell);
            row.appendChild(quantityCell);

            // Add the row to the table
            tableBody.appendChild(row);
        });
    });
});


function drawChart(data) {
    const dataTable = google.visualization.arrayToDataTable(data);
    const options = {
        title: 'Product Quantities'
    };
    const chart = new google.visualization.BarChart(document.getElementById('myChart'));
    chart.draw(dataTable, options);
}

function addProduct() {
    // Get the input values
    const ingredientName = document.getElementById('ingredientName').value;
    const ingredientDescription = document.getElementById('ingredientDescription').value;
    const ingredientQuantity = document.getElementById('ingredientQuantity').value;

    // Get a reference to the count document
    const countDoc = db.collection('metadata').doc('ingredientCount');

    // Run a transaction to increment the count and add the new ingredient
    db.runTransaction((transaction) => {
        return transaction.get(countDoc).then((doc) => {
            if (!doc.exists) {
                throw "Document does not exist!";
            }

            // Compute the new ID
            const newID = doc.data().count + 1;

            // Increment the count in the count document
            transaction.update(countDoc, { count: newID });

            // Add the new ingredient with the new ID
            transaction.set(db.collection('ingredients').doc(newID.toString()), {
                id: newID,
                name: ingredientName,
                description: ingredientDescription,
                quantity: ingredientQuantity
            });
        });
    }).then(() => {
        console.log('Transaction successfully committed!');
    }).catch((error) => {
        console.error('Transaction failed: ', error);
    });
}
