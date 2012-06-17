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
StorageService.database = null;

StorageService.init = function(callback) {
    Pouch('idb://todos', function(err, db) {
        if(!err) {
	     StorageService.database = db;
             // eeewww
             StorageService.getAll(callback);
        }        
    });
}
StorageService.put = function(value, callback) {
    StorageService.database.post(value, function(err, response) {
        if(!err) {
             StorageService.getAll(callback);
        }
    });
}
StorageService.get = function(id, callback) {
    StorageService.database.get(id, function(err, response) {
        if(!err) {
             callback(response);
        }
    })
}
StorageService.getAll = function(callback) {
    if(!StorageService.database) {
        StorageService.init(callback);
        return;
    }

    StorageService.database.allDocs({reduce: false, include_docs: true,}, function(err, response) {
        if(!err) {
             var data = [];
             if(response.rows == 0) {
                 callback(data);
             } else {
                 $.each(response.rows, function (index, item) {
                     StorageService.get(item.id, function(result) {
                         data.push(result);
		         if (index === response.rows.length-1) {
                             callback(data);
                         }
                     });
                 });
            }
        }
    });
}
StorageService.remove = function(id, callback) {
    StorageService.get(id, function(doc) {
        StorageService.database.remove(doc, function(err, response) {
            if(!err) {
                StorageService.getAll(callback);
            }
        });
    });
}

// TodoController
TodoController = {}
TodoController.TIMERINTERVAL = 10;	// in seconds

TodoController.init = function() {
    StorageService.getAll(TodoController.updateList);

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

    // Set timer to show dates on notes in human readable form
    setInterval(TodoController.timerTick, TodoController.TIMERINTERVAL * 1000);
}


TodoController.updateList = function(todos) {
    var todoList = $('#todoList');
    // Remove all except the first line
    todoList.find("li:gt(0)").remove();

    $('#todoCount').html(todos.length);

    // Sort documents by date    
    todos.sort( function(a, b) { return (new Date(a.date).getTime() - new Date(b.date).getTime()) } );

    $.each(todos, function (index, item) {
        var delLink = $('<a href="#"></a>');
        delLink.click(function () {
            TodoController.deleteTodo(item._id);
        });
        var todoLink = $('<a href="#"><h3>' + item.todo + '</h3><p><span class="date" title="' + item.date + '">' + item.date + '</span></p></a>');
        var todoItem = $('<li>').append(todoLink).append(delLink);

        todoList.append(todoItem);
    });

    // Force timerTick
    TodoController.timerTick();

    todoList.listview('refresh');
}

TodoController.timerTick = function() {
    // Make dates human readable
    $('.date').easydate({live: false});		// disable plugins live view

    return true;
}

TodoController.deleteTodo = function(id) {
    StorageService.remove(id, TodoController.updateList);
}

TodoController.addTodo = function(value) {
    if(value == '') {
        // Bailout
        return false;
    }

    // Construct JSON object
    var now = new Date().toUTCString();
    var todo = {
        'todo': value,
        'date': now
    };

    // Persist in localstorage
    StorageService.put(todo, TodoController.updateList);

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

