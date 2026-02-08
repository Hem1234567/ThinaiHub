function doPost(e) {
    try {
        // 1. Get the active spreadsheet and "Orders" sheet
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName("Orders");

        // Create "Orders" sheet if it doesn't exist
        if (!sheet) {
            sheet = ss.insertSheet("Orders");
            // Add headers if new sheet
            sheet.appendRow([
                "Order ID", "Date", "Customer Name", "Email", "Phone",
                "Shipping Address", "Payment Mode", "Total Amount", "Status", "Items"
            ]);
        }

        // 2. Parse the incoming JSON data
        var params = JSON.parse(e.postData.contents);
        var orders = params.orders; // Expecting { orders: [...] }

        // 3. Loop through orders and append explicitly
        // Note: This appends ALL sent orders. You might want to clear sheet first or check for duplicates.
        // For this version, we'll just append.

        // Optional: Clear existing content if you want a fresh export every time
        // sheet.clearContents(); 
        // sheet.appendRow(["Order ID", "Date", ...]); // Re-add headers

        var newRows = [];
        for (var i = 0; i < orders.length; i++) {
            var order = orders[i];
            newRows.push([
                order.id,
                order.date,
                order.customerName,
                order.email,
                order.phone,
                order.address,
                order.paymentMode,
                order.total,
                order.status,
                order.items
            ]);
        }

        if (newRows.length > 0) {
            // Efficiently write all rows at once
            sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
        }

        return ContentService.createTextOutput(JSON.stringify({ "result": "success", "count": newRows.length }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Helper for testing GET requests
function doGet(e) {
    return ContentService.createTextOutput("Web App is running. Use POST to send data.");
}
