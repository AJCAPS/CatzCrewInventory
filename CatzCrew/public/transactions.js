let db;
document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    db = firebase.firestore();

    const transactions = db.collection('receipts');

    transactions.get().then((querySnapshot) => {
        const tableBody = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];

        querySnapshot.forEach((doc) => {
            const transactionData = doc.data();

            // Create a new row and cells
            let row = document.createElement('tr');
            let idCell = document.createElement('td');
            let dateCell = document.createElement('td');
            let orderedItemsCell = document.createElement('td');
            let paymentCell = document.createElement('td');

            // Set the text of the cells
            idCell.textContent = transactionData.transactionID;
            dateCell.textContent = transactionData.date;
            orderedItemsCell.textContent = transactionData.ordereditems;
            paymentCell.textContent = transactionData.totalpayment;


            // Add the cells to the row
            row.appendChild(idCell);
            row.appendChild(dateCell);
            row.appendChild(orderedItemsCell);
            row.appendChild(paymentCell);
            row.setAttribute('onclick', `displayDetails('${doc.id}')`);
            // Add the row to the table
            tableBody.appendChild(row);
        });
        updateIngredients();
    });
});

function addTransaction() {
    // Get the product data from the input fields
    const transactionID = document.getElementById('transactionID').value;
    const transactionDate = document.getElementById('transactionDate').value;
    const transactionPayment = document.getElementById('transactionPayment').value;
  
    // Get a reference to the ingredients table
    const orderedItemsTableBody = document.getElementById('orderedItemsTableBody');
  
    // Get the ingredients data from the table
    let ordereditems = '';
    for (let i = 0; i < orderedItemsTableBody.rows.length; i++) {
      const row = orderedItemsTableBody.rows[i];
      if (row.cells.length < 2) {
        console.error('Row does not have enough cells', row);
        continue;
      }
      const itemName = row.cells[0].firstChild.value;
      const itemQuantity = row.cells[1].firstChild.value;
      ordereditems += `${itemName}-${itemQuantity}, `;
    }
    // Remove the trailing comma and space
    ordereditems = ordereditems.slice(0, -2);
  
    // Add a new product document to Firestore
    db.collection('receipts').doc(transactionID).set({
      transactionID: transactionID,
      date: transactionDate,
      totalpayment: transactionPayment,
      ordereditems: ordereditems
    }).then(() => {
      console.log('Document written with ID: ', transactionID);
    }).catch((error) => {
      console.error('Error adding document: ', error);
    });
  }


  function saveTransaction() {
    // Get the product data from the input fields
    const transactionID = document.getElementById('transactionID').value;
    const transactionDate = document.getElementById('transactionDate').value;
    const transactionPayment = document.getElementById('transactionPayment').value;
  
    // Get a reference to the ingredients table
    const orderedItemsTableBody = document.getElementById('orderedItemsTableBody');
  
    // Get the ingredients data from the table
    let ordereditems = '';
    for (let i = 0; i < orderedItemsTableBody.rows.length; i++) {
      const row = orderedItemsTableBody.rows[i];
      if (row.cells.length < 2) {
        console.error('Row does not have enough cells', row);
        continue;
      }
      const itemName = row.cells[0].firstChild.value;
      const itemQuantity = row.cells[1].firstChild.value;
      ordereditems += `${itemName}-${itemQuantity}, `;
    }
    // Remove the trailing comma and space
    ordereditems = ordereditems.slice(0, -2);
  
    // Add a new product document to Firestore
    db.collection('receipts').doc(transactionID).update({
      transactionID: transactionID,
      date: transactionDate,
      totalpayment: transactionPayment,
      ordereditems: ordereditems
    }).then(() => {
      console.log('Document successfully updated!');
    }).catch((error) => {
      console.error('Error saving document: ', error);
    });
  }

function displayDetails(id) {
    // Get the product data from Firestore
    db.collection('receipts').doc(id).get().then((doc) => {
      if (doc.exists) {
        const transactionData = doc.data();
  
        // Display the product data in the input fields
        document.getElementById('transactionID').value = transactionData.transactionID;
        document.getElementById('transactionDate').value = transactionData.date;
        document.getElementById('transactionPayment').value = transactionData.totalpayment;
  
        // Save the id of the currently displayed product
        document.getElementById('currentProduct').value = id;

        const products = transactionData.ordereditems.split(', ');
  
        // Get a reference to the ingredients table
        const orderedItemsTableBody = document.getElementById('orderedItemsTableBody');
  
        // Clear the current rows in the ingredients table
        orderedItemsTableBody.innerHTML = '';
  
        // Create a new row in the ingredients table for each ingredient
        products.forEach(product => {
          const [name, quantity] = product.split('-');
  
          // Create a new row
          const row = document.createElement('tr');
  
          // Create the 'name' cell with an input box
          const nameCell = document.createElement('td');
          const nameInput = document.createElement('input');
          nameInput.type = 'text';
          nameInput.value = name;
          nameCell.appendChild(nameInput);
  
          // Create the 'quantity' cell with an input box
          const quantityCell = document.createElement('td');
          const quantityInput = document.createElement('input');
          quantityInput.type = 'number';
          quantityInput.value = quantity;
          quantityCell.appendChild(quantityInput);
  
          // Add the cells to the row
          row.appendChild(nameCell);
          row.appendChild(quantityCell);
  
          // Add the row to the table
          orderedItemsTableBody.appendChild(row);
        });
      } else {
        console.log("No such document!");
      }
    }).catch((error) => {
      console.log("Error getting document:", error);
    });
  }

  function addRow() {
    // Get a reference to the ingredients table
    const orderedItemsTableBody = document.getElementById('orderedItemsTableBody');
  
    // Create a new row
    const row = document.createElement('tr');
  
    // Create the 'name' cell with an input box
    const nameCell = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameCell.appendChild(nameInput);
  
    // Create the 'quantity' cell with an input box
    const quantityCell = document.createElement('td');
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityCell.appendChild(quantityInput);
  
    // Add the cells to the row
    row.appendChild(nameCell);
    row.appendChild(quantityCell);
  
    // Add the row to the table
    orderedItemsTableBody.appendChild(row);
  }async function updateIngredients() {
    // Get all unprocessed receipts
    const receiptsSnapshot = await db.collection('receipts').where('processed', '==', false).get();
    receiptsSnapshot.forEach(async (doc) => {
        const receipt = doc.data();
        // Split the orderedItems string into individual items
        const orderedItems = receipt.ordereditems.split(', ');
        // For each ordered item in the receipt
        for (const item of orderedItems) {
            // Split the item into name and quantity
            const [itemName, quantity] = item.split('-');
            // Get the product document
            const productDoc = await db.collection('products').where('name', '==', itemName).get();
            productDoc.forEach(async (doc) => {
                const product = doc.data();
                // For each ingredient in the product
                for (const ingredientId of product.ingredients) {
                    // Get the ingredient document
                    const ingredientDoc = await db.collection('ingredients').doc(ingredientId).get();
                    const ingredient = ingredientDoc.data();
                    // Deduct quantity
                    const newQuantity = ingredient.quantity - quantity;
                    // Update the ingredient document
                    await db.collection('ingredients').doc(ingredientId).update({ quantity: newQuantity });
                }
            });
        }
        // Mark the receipt as processed
        await db.collection('receipts').doc(doc.id).update({ processed: true });
    });
}
async function updateIngredients() {
    // Get all unprocessed receipts
    const receiptsSnapshot = await db.collection('receipts').where('processed', '==', false).get();
    receiptsSnapshot.forEach(async (doc) => {
        const receipt = doc.data();
        // Split the orderedItems string into individual items
        const orderedItems = receipt.ordereditems.split(', ');
        // For each ordered item in the receipt
        for (const item of orderedItems) {
            // Split the item into name and quantity
            const [itemName, itemQuantity] = item.split('-');
            // Get the product document
            const productDoc = await db.collection('products').where('name', '==', itemName).get();
            productDoc.forEach(async (doc) => {
                const product = doc.data();
                // Split the ingredients string into individual ingredients
                const ingredients = product.ingredients.split(', ');
                // For each ingredient in the product
                for (const ingredient of ingredients) {
                    // Split the ingredient into name and quantity
                    const [ingredientName, ingredientQuantity] = ingredient.split('/');
                    // Get the ingredient document
                    const ingredientDoc = await db.collection('ingredients').where('name', '==', ingredientName).get();
                    ingredientDoc.forEach(async (doc) => {
                        const ingredient = doc.data();
                        // Deduct quantity
                        const newQuantity = ingredient.quantity - itemQuantity * ingredientQuantity;
                        // Update the ingredient document
                        await db.collection('ingredients').doc(doc.id).update({ quantity: newQuantity });
                    });
                }
            });
        }
        // Mark the receipt as processed
        await db.collection('receipts').doc(doc.id).update({ processed: true });
    });
}

  
  

