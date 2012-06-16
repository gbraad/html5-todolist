// A simple To-do application written in HTML
// Copyright (C) 2012 Gerard Braad
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


StorageService = {}

StorageService.setObject = function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
StorageService.getObject = function(key) {
    var value = localStorage.getItem(key);
    return value && JSON.parse(value);
}

StorageService.isSupported = function() {
    return typeof (Storage) !== "undefined";
}


// TodoController
TodoController = {}

TodoController.init = function() {
    // Check if local storage is supported
    if (StorageService.isSupported()) {
        if (!StorageService.getObject('todos')) {
            TodoController.addTodo('Add my to-dos');
        }
        TodoController.updateList();
    } else {
        // No support for localStorage
        $('#todoListHeader').text("No Storage support");
    }

    // Bind to keypress event for the input
    $('#todo').bind('keypress', function(e) {
        code = (e.keyCode ? e.keyCode : e.which)
        if (code == 13) {
            var value = $('#todo').val();
            if(value != '') {
                TodoController.addTodo(value);
            }
            e.preventDefault();

	    // Empty fields
            $('#todo').val('');
	}
    });
}

TodoController.updateList = function() {
    var todoList = $('#todoList');
    // Remove all except the first line
    todoList.find("li:gt(0)").remove();
    //todoList.remove();

    $.each(StorageService.getObject('todos'), function (index, item) {
        var delLink = $('<a href="#"></a>');
        delLink.click(function () {
            TodoController.deleteTodo(index)
        });
        var todoLink = $('<a href="#"><h3>' + item.todo + '</h3></a>');
        var todoItem = $('<li>').append(todoLink).append(delLink);

        todoList.append(todoItem);
    });
    todoList.listview('refresh');
}

TodoController.deleteTodo = function(index) {
    var todos = StorageService.getObject('todos');
    todos.splice(index, 1);
    // Persist in localstorage
    StorageService.setObject('todos', todos);

    TodoController.updateList();
}

TodoController.addTodo = function(value) {
    if(value == '') {
        // Bailout
        return false;
    }

    // Construct JSON object
    var todo = {
        'todo': value
    };

    // Get existing list of objects
    var todos = StorageService.getObject('todos');
    if (!todos) {
        todos = [];
    }

    // Add to list
    todos.push(todo);

    // Persist in localstorage
    StorageService.setObject('todos', todos);

    TodoController.updateList();

    return true;
}


// Main function
$(document).bind('pagecreate', function() {
    // Background styling for dialogs
    $('div[data-role="dialog"]').live('pagebeforeshow', function(e, ui) {
        ui.prevPage.addClass("ui-dialog-background");
    });

    $('div[data-role="dialog"]').live('pagehide', function(e, ui) {
        $(".ui-dialog-background ").removeClass("ui-dialog-background");
    });

    TodoController.init();
});

