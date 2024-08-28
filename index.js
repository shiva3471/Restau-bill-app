document.addEventListener("DOMContentLoaded", () => {
  let tableStack = []; // Stack to store the last four searched tables
  let menuStack = []; // Stack to store the last four searched menu items
  let selectedTableDiv = null; // Variable to keep track of the selected table div

  const tables = [
    { name: "Table-1", total: 0, items: 0, orders: [] },
    { name: "Table-2", total: 0, items: 0, orders: [] },
    { name: "Table-3", total: 0, items: 0, orders: [] },
    { name: "Table-4", total: 0, items: 0, orders: [] },
    // Add more tables if needed
  ];

  // Initialize the stack with tables 1 to 4
  tableStack = tables.slice(0, 4);

  const menu = [
    { name: "Pulav", cost: 250, category: "maincourse" },
    { name: "Pasta", cost: 180, category: "maincourse" },
    { name: "Biryani", cost: 200, category: "maincourse" },
    { name: "Kaju paneer", cost: 150, category: "maincourse" },
    { name: "Manchuria", cost: 100, category: "starters" },
    { name: "Coke", cost: 50, category: "drinks" },
    { name: "Crispy corn", cost: 120, category: "starters" },
    { name: "Paneer 65", cost: 80, category: "starters" },
    { name: "Gobi manchuria", cost: 80, category: "starters" },
    { name: "Ice Cream", cost: 100, category: "desserts" },
    { name: "Red velvet Cake", cost: 150, category: "desserts" },
    { name: "Brownie", cost: 150, category: "desserts" },
    { name: "Sethaphal", cost: 150, category: "desserts" },
    { name: "Sprite", cost: 50, category: "drinks" },
    { name: "Thumsup", cost: 70, category: "drinks" },
    { name: "Mojito", cost: 70, category: "drinks" },
    // Add more menu items if needed
  ];

  // Initialize the menu stack with the first four items
  menuStack = menu.slice(0, 16);

  const tableContainer = document.querySelector(".table-container");
  const menuContainer = document.querySelector(".menu-container");
  const modal = document.getElementById("tableModal");
  const closeModal = document.querySelector(".close");
  const orderDetails = document.getElementById("orderDetails");
  const generateBillButton = document.getElementById("generateBill");

  function debounce(cb, delay = 2000) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => cb(...args), delay);
    };
  }

  function throttle(cb, delay = 2000) {
    let shouldWait = false;
    let waitingArgs;

    const timeoutFunc = () => {
      if (waitingArgs == null) {
        shouldWait = false;
      } else {
        cb(...waitingArgs);
        waitingArgs = null;
        setTimeout(timeoutFunc, delay);
      }
    };

    return (...args) => {
      if (shouldWait) {
        waitingArgs = args;
        return;
      }
      cb(...args);
      shouldWait = true;
      setTimeout(timeoutFunc, delay);
    };
  }

  // Search tables
  function tablesearch() {
    const input = document
      .querySelector(".tables input")
      .value.toLowerCase()
      .trim();
    tableContainer.innerHTML = "";

    if (!input) {
      // If search input is empty, display top four tables from the stack
      displayTablesFromStack();
      return;
    }

    if (!isNaN(input) && parseInt(input) >= 1) {
      const tableNumber = parseInt(input);
      const tableName = `Table-${tableNumber}`;
      let table = tables.find(
        (t) => t.name.toLowerCase() === tableName.toLowerCase()
      );

      if (!table) {
        // If table does not exist, create a new one and add to the array
        table = { name: tableName, total: 0, items: 0, orders: [] };
        tables.push(table);
      }

      // Display the searched table
      const tableDiv = document.createElement("div");
      tableDiv.className = "table";
      tableDiv.innerHTML = `<p>${table.name}</p><br><pre>items:${table.items}</pre><pre>total:${table.total}Rs/-</pre>`;
      tableContainer.appendChild(tableDiv);

      // Update the stack
      updateTableStack(table);

      // Add drop event listener
      tableDiv.addEventListener("dragover", (e) => e.preventDefault());
      tableDiv.addEventListener("drop", (e) => handleDrop(e, table));
      tableDiv.addEventListener("click", () => {
        selectTable(tableDiv, table);
      });
      addTouchEventListeners(tableDiv, table);
    }
  }

  // Display top four tables from the stack
  function displayTablesFromStack() {
    tableContainer.innerHTML = "";
    tableStack
      .slice()
      .reverse()
      .forEach((table) => {
        // Reverse the stack for display
        const tableDiv = document.createElement("div");
        tableDiv.className = "table";
        tableDiv.innerHTML = `<p>${table.name}</p><br><pre>items:${table.items}</pre><pre>total:${table.total}Rs/-</pre>`;
        tableContainer.appendChild(tableDiv);

        // Add drop event listener
        tableDiv.addEventListener("dragover", (e) => e.preventDefault());
        tableDiv.addEventListener("drop", (e) => handleDrop(e, table));
        tableDiv.addEventListener("click", () => {
          selectTable(tableDiv, table);
        });
        addTouchEventListeners(tableDiv, table);

        // Reapply yellow background if this is the selected table
        if (
          selectedTableDiv &&
          tableDiv.querySelector("p").innerText ===
            selectedTableDiv.querySelector("p").innerText
        ) {
          tableDiv.style.backgroundColor = "yellow";
        }
      });
  }

  // Update the table stack with the latest searched table
  function updateTableStack(table) {
    // Remove the table from the stack if it already exists
    tableStack = tableStack.filter((t) => t.name !== table.name);

    // If the stack has 4 tables, remove the oldest one
    if (tableStack.length >= 4) {
      tableStack.shift();
    }

    // Add the new table to the stack
    tableStack.push(table);
  }

  function menusearch() {
    const input = document
      .querySelector(".menu input")
      .value.toLowerCase()
      .trim();
    menuContainer.innerHTML = "";

    if (!input) {
      // If search input is empty, display top four menu items from the stack
      displayMenuFromStack();
      return;
    }

    const filteredMenu = menu.filter(
      (item) =>
        item.name.toLowerCase().includes(input) ||
        item.category.toLowerCase().includes(input)
    );

    filteredMenu.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "items";
      itemDiv.innerHTML = `<p>${item.name}</p><br><pre> </pre><pre>Cost:${item.cost}</pre>`;
      itemDiv.draggable = true;
      itemDiv.addEventListener("dragstart", (e) => handleDragStart(e, item));
      addTouchEventListenersToMenu(itemDiv, item);
      menuContainer.appendChild(itemDiv);
    });

    // Update the stack with the first item in the filtered menu
    if (filteredMenu.length > 0) {
      updateMenuStack(filteredMenu[0]);
    }
  }

  // Display top four menu items from the stack
  function displayMenuFromStack() {
    menuContainer.innerHTML = "";
    menuStack
      .slice()
      .reverse()
      .forEach((item) => {
        // Reverse the stack for display
        const itemDiv = document.createElement("div");
        itemDiv.className = "items";
        itemDiv.innerHTML = `<p>${item.name}</p><br><pre> </pre><pre>Cost:${item.cost}</pre>`;
        itemDiv.draggable = true;
        itemDiv.addEventListener("dragstart", (e) => handleDragStart(e, item));
        addTouchEventListenersToMenu(itemDiv, item);
        menuContainer.appendChild(itemDiv);
      });
  }

  // Update the menu stack with the latest searched menu item
  function updateMenuStack(item) {
    // Remove the item from the stack if it already exists
    menuStack = menuStack.filter((i) => i.name !== item.name);

    // If the stack has 4 items, remove the oldest one
    if (menuStack.length >= 4) {
      menuStack.shift();
    }

    // Add the new item to the stack
    menuStack.push(item);
  }

  function handleDragStart(event, item) {
    event.dataTransfer.setData("text/plain", JSON.stringify(item));
  }

  function handleDrop(event, table) {
    event.preventDefault();
    const item = JSON.parse(event.dataTransfer.getData("text/plain"));
    addItemToTable(table, item);
  }

  function addTouchEventListenersToMenu(itemDiv, item) {
    itemDiv.addEventListener("touchstart", (e) => handleTouchStart(e, item));
    itemDiv.addEventListener("touchend", (e) => handleTouchEnd(e, item));
  }

  function addTouchEventListeners(tableDiv, table) {
    tableDiv.addEventListener("touchstart", (e) => handleTouchStart(e, table));
    tableDiv.addEventListener("touchend", (e) => handleTouchEnd(e, table));
  }

  function handleTouchStart(event, item) {
    event.dataTransfer = {
      setData: (format, data) => {
        event.target.dataset[format] = data;
      },
      getData: (format) => {
        return event.target.dataset[format];
      },
    };
    handleDragStart(event, item);
  }

  function handleTouchEnd(event, table) {
    handleDrop(event, table);
  }

  function addItemToTable(table, item) {
    const existingOrder = table.orders.find(
      (order) => order.item.name === item.name
    );

    if (existingOrder) {
      existingOrder.quantity += 1;
    } else {
      table.orders.push({ item: item, quantity: 1 });
    }

    table.total += item.cost;
    table.items += 1;

    // Update the table display
    updateTableDisplay(table);
  }

  function updateTableDisplay(table) {
    const tableDiv = Array.from(
      tableContainer.getElementsByClassName("table")
    ).find((div) => div.querySelector("p").innerText === table.name);

    if (tableDiv) {
      tableDiv.innerHTML = `<p>${table.name}</p><br><pre>items:${table.items}</pre><pre>total:${table.total}Rs/-</pre>`;
    }

    // Reapply yellow background if this is the selected table
    if (
      selectedTableDiv &&
      tableDiv.querySelector("p").innerText ===
        selectedTableDiv.querySelector("p").innerText
    ) {
      tableDiv.style.backgroundColor = "yellow";
    }
  }

  function selectTable(tableDiv, table) {
    // Clear previous selection
    if (selectedTableDiv) {
      selectedTableDiv.style.backgroundColor = "";
    }

    // Highlight the selected table
    tableDiv.style.backgroundColor = "yellow";
    selectedTableDiv = tableDiv;

    // Show modal with order details
    showModal(table);
  }

  function showModal(table) {
    modal.style.display = "block";
    orderDetails.innerHTML = `
            <h2>${table.name} | Order Details</h2>
            <table>
                <tr>
                    <th>S.No</th>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Number of Servings</th>
                    <th>Delete</th>
                </tr>
                ${table.orders
                  .map(
                    (order, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${order.item.name}</td>
                        <td>${order.item.cost.toFixed(2)}</td>
                        <td>
                            <input type="number" value="${
                              order.quantity
                            }" min="1" data-index="${index}" class="quantity-input" />
                        </td>
                        <td>
                            <button class="delete-button" data-index="${index}">🗑️</button>
                        </td>
                    </tr>
                `
                  )
                  .join("")}
            </table>
            <p>Total: ${table.total.toFixed(2)}Rs/-</p>
        `;

    // Attach event listeners for quantity inputs and delete buttons
    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", () => {
        const index = input.getAttribute("data-index");
        const newQuantity = parseInt(input.value);
        updateOrderQuantity(table, table.orders[index], newQuantity);
      });
    });

    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", () => {
        const index = button.getAttribute("data-index");
        deleteOrder(table, table.orders[index]);
      });
    });
  }

  function updateOrderQuantity(table, order, newQuantity) {
    table.total += (newQuantity - order.quantity) * order.item.cost;
    table.items += newQuantity - order.quantity;
    order.quantity = newQuantity;

    // Update the table display
    updateTableDisplay(table);

    // Update the modal display
    showModal(table);
  }

  function deleteOrder(table, order) {
    table.orders = table.orders.filter((o) => o !== order);
    table.total -= order.item.cost * order.quantity;
    table.items -= order.quantity;

    // Update the table display
    updateTableDisplay(table);

    // Update the modal display
    showModal(table);
  }

  closeModal.addEventListener("click", () => {
    selectedTableDiv.style.backgroundColor = "";
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      selectedTableDiv.style.backgroundColor = "";
    }
  });

  document
    .querySelector(".tables input")
    .addEventListener("input", debounce(tablesearch, 500));
  document
    .querySelector(".menu input")
    .addEventListener("input", throttle(menusearch, 2000));

  // Display initial tables and menu items
  displayTablesFromStack();
  displayMenuFromStack();

  const addButton = document.querySelector(".add-button");
  const modal1 = document.getElementById("addItemModal");
  const closeModal1 = document.querySelector(".close-add-item-modal");
  const addItemForm = document.getElementById("addItemForm");

  // Show the modal when "Add Item" button is clicked
  addButton.addEventListener("click", () => {
    modal1.style.display = "block";
  });

  // Hide the modal when the close button is clicked
  closeModal1.addEventListener("click", () => {
    modal1.style.display = "none";
  });

  // Hide the modal when clicking outside of the modal content
  window.addEventListener("click", (event) => {
    if (event.target === modal1) {
      modal1.style.display = "none";
    }
  });

  // Handle form submission
  addItemForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Get form values
    const itemName = document.getElementById("itemName").value;
    const itemType = document.getElementById("itemType").value;
    const itemCost = document.getElementById("itemCost").value;

    // Find the item in the menu
    let existingItem = menu.find(
      (item) => item.name.toLowerCase() === itemName.toLowerCase()
    );

    if (existingItem) {
      // If item exists, update its properties
      existingItem.cost = parseInt(itemCost);
      existingItem.category = itemType;
    } else {
      // If item does not exist, add it to the menu
      menu.push({
        name: itemName,
        cost: parseInt(itemCost),
        category: itemType,
      });
    }

    // Reset the form and close the modal
    addItemForm.reset();
    modal1.style.display = "none";
    displayMenuFromStack();


  });
});
