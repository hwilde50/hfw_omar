'use strict';

$(document).ready(function () {
    // Load the menu for this module
    var menu = fn_create_menu("objectives");
    $("#div_side_menu").html(menu);

    // display it on form
    var initial_display_date = dayjs();
    $("#month_selected").val(fn_date_formatted(initial_display_date, "for_display"));

    // Get the list of objectives for the current month
    fn_get_objectives_list(fn_date_formatted(initial_display_date, "for_db"));
});

// Open modal for Add
$(document).on('click', '.title-btn-add', function () {
    var current_date = dayjs();
    $("#modal_add_edit").show();
    $(".page-container").hide();
    $("#div_modal_title").html("Add Objective");
    $("#txt_modal_date_due").val(fn_date_formatted(current_date, "for_display"));
    $("#txt_modal_status").val("Not Started");
    $("#txt_modal_description").val("");
    $("#txt_modal_description").focus();
    $("#lbl_modal_new_note").hide();
    $("#txt_modal_new_note").val("");
    $("#txt_modal_new_note").hide();
    $("#div_modal_objective_notes").hide();
});    

$(document).on('click', '.close', function () {
    $("#modal_add_edit").hide();
    $(".page-container").show();
});

$(document).on('click', '#btn_modal_cancel', function () {
    $("#modal_add_edit").hide();
    $(".page-container").show();
});

// Click edit icon in grid and open modal for edit
$(document).on('click', '.edit-icon', function () {
    var id = this.id;
    $("#txt_hidden_objective_id").val(id);
    $("#txt_modal_status").show();
    $("#lbl_modal_new_note").show();
    $("#txt_modal_new_note").val("");
    $("#txt_modal_new_note").show();
    
    fn_get_objective(id);
});    

$(document).on('click', '#title_btn_menu', function () {
    fn_open_menu();
});

$(document).on('click', '#btn_month_minus', function () {
    var current_date = $("#month_selected").val() + "-01"; 
    var new_date = fn_update_date_selected("subtract", current_date);
    var new_month = dayjs(new_date).format("MMMM YYYY");
    $("#month_selected").val(new_month);
    fn_get_objectives_list(new_date);
});

$(document).on('click', '#btn_month_plus', function () {
    var current_date = $("#month_selected").val() + "-01"; 
    var new_date = fn_update_date_selected("add", current_date);
    var new_month = dayjs(new_date).format("MMMM YYYY");
    $("#month_selected").val(new_month);
    fn_get_objectives_list(new_date);
});

$(document).on('click', '#btn_status_previous', function () {
    var current_status = $("#txt_modal_status").val(); 
    var new_status= fn_update_status("previous", current_status);
    $("#txt_modal_status").val(new_status);
});

$(document).on('click', '#btn_status_next', function () {
    var current_status = $("#txt_modal_status").val(); 
    var new_status= fn_update_status("next", current_status);
    $("#txt_modal_status").val(new_status);
});

$(document).on('click', '#btn_date_due_minus', function () {
    var current_date = $("#txt_modal_date_due").val() + "-01"; 
    var new_date = fn_update_date_selected("subtract", current_date);
    var new_month = dayjs(new_date).format("MMMM YYYY");
    $("#txt_modal_date_due").val(new_month);
});

$(document).on('click', '#btn_date_due_plus', function () {
    var current_date = $("#txt_modal_date_due").val() + "-01"; 
    var new_date = fn_update_date_selected("add", current_date);
    var new_month = dayjs(new_date).format("MMMM YYYY");
    $("#txt_modal_date_due").val(new_month);
});

$(document).on('click', '#btn_modal_save', function () {

    var user_id = 1;

    // Set a value for now for the added_on and updated_on fields.
    var now = dayjs().format("YYYY-MM-DD HH:ss");

    // Check the title of the modal to determine Add or Edit.
    var action = $("#div_modal_title").html();

    // Get the values from the fields
    var objective_id = $("#txt_hidden_objective_id").val();
    var description = $("#txt_modal_description").val();
    var date_due = $("#txt_modal_date_due").val();
    var status = $("#txt_modal_status").val();

    var date_due_formatted = dayjs(date_due + "-01").endOf('month').format('YYYY-MM-DD');
    let json = {};

    if (action == "Add Objective") {
        var path = "https://hfw-tech.ddns.net/obj/objective_add";
        json.description = description;
        json.date_due = date_due_formatted;
        json.status = status;
        json.added_on = now;
        json.added_by_id = user_id;
        json.updated_on = now;
        json.updated_by_id = user_id;

    } else {  //edit
        var path = "https://hfw-tech.ddns.net/obj/objective_update";
        json.id = objective_id;
        json.description = description;
        json.date_due = date_due_formatted;
        json.status = status;
        json.added_on = now;
        json.added_by_id = user_id;
        json.updated_on = now;
        json.updated_by_id = user_id;
        json.note = $("#txt_modal_new_note").val();
    }
    // console.log(JSON.stringify(json, null, 2));

    // Create or update data.
    var request = $.ajax({
        type: "POST",
        url: path,
        data: JSON.stringify(json),
        contentType: "application/json",
    });

    request.done(function( msg ) {
        // Reload list
        var current_date = dayjs();
        fn_get_objectives_list(fn_date_formatted(current_date, "for_db"));
        $("#month_selected").val(fn_date_formatted(current_date, "for_display"));

        // Hide modal
        $("#modal_add_edit").hide();
        $(".page-container").show();            
    });

    request.fail(function( jqXHR, textStatus) {
        alert("Request to create or update objective: " + textStatus);
    });
});

function fn_get_objectives_list(month) {

    var path = "https://hfw-tech.ddns.net/obj/objective_list/" + month;

    var obj = $.getJSON( path, function(data, status) {
        var list = "";
        var count = 0;

        // console.log("month=" + month);
        // console.log(JSON.stringify(data, null, 2));

        // Column headings
        list = '<div class="page-grid-cell col-heading"><i class="fa fa-pencil"></i></div>';
        list += '<div class="page-grid-cell col-heading">Description</div>';
        list += '<div class="page-grid-cell col-heading">Status</div>';

        $.each(data, function(key, value){
            count += 1;
            list += '<div class="page-grid-cell edit-icon" id=' + data[key].id + '>' + count + '</div>';
            list += '<div class="page-grid-cell">' + data[key].description + '</div>';
            list += '<div class="page-grid-cell">' + data[key].status + '</div>';
        });

        $("#div_objective_list").html(list);
        // console.log(JSON.stringify(data, null, 2));
    })
    .done(function() {
        
    })
    .fail(function() {
        alert("Failed to get objectives");
    });
}

function fn_get_objective(id) {

    var path = "https://hfw-tech.ddns.net/obj/objective/" + id;

    var obj = $.getJSON( path, function(data, status) {

        // console.log(JSON.stringify(data, null, 2));

        $.each(data, function(key, value){
            var date_due_formatted = dayjs(data[key].date_due).format('MMMM YYYY');
            $("#txt_hidden_objective_id").val(data[key].id);
            $("#txt_modal_description").val(data[key].description);
            $("#txt_modal_date_due").val(date_due_formatted);
            $("#txt_modal_status").val(data[key].status);
            $("#txt_modal_new_note").val("");
                        
            $("#modal_add_edit").show();
            $(".page-container").hide();
            $("#div_modal_title").html("Edit Objective");
        });
        fn_get_objective_notes(id);
    })
    .done(function() {

    })
    .fail(function() {
        alert("Failed to get objective - " + id);
    });
}

function fn_update_date_selected(action, current) {
    if (action == "add") {
        var new_date = dayjs(current).add(1, 'month').endOf('month');
        var new_date_formatted = new_date.format("YYYY-MM-DD");
    } else {
        var new_date = dayjs(current).subtract(1, 'month').endOf('month');
        var new_date_formatted = new_date.format("YYYY-MM-DD");
    }
    return new_date_formatted;
}

function fn_update_status (action, current) {
    // Actions will be "next" and "previous"

    const statuses = ["Not Started", "Started", "Done", "Not Done", "Cancelled"];
    var len = statuses.length;
    var current_position = 0;
    var new_position = 0;

    for (var i = 0; i < len; i++) {
        if (statuses[i] == current) {
            current_position = i;
        }
    }
    if (action == "next") {
        new_position = current_position + 1;
        if (new_position > 4) {
            new_position = 0;
        } 
    } else {
        new_position = current_position - 1;
        if (new_position < 0) {
            new_position = len - 1;
        }
    }
    return statuses[new_position];
}

function fn_get_objective_notes(objective_id){
    
    var path = "https://hfw-tech.ddns.net/obj/objective_notes/" + objective_id;
    
    var obj = $.getJSON( path, function(data, status) {
        console.log(JSON.stringify(data, null, 2));

        var notes = "<div class='form-label'>Notes:</div>";

        $.each(data, function(key, value){
            console.log(data[key].added_on);

            var note_header = dayjs(data[key].added_on).format("ddd M/D/YYYY h:mm A") + " by " + data[key].initials;

            notes += "<div class='notes-header'>";
                notes += "<span class='fa fa-circle note-header-icon'></span>" + "<span class='note-header-text'>" + note_header + "</span>";
            notes += "</div>";

            notes += "<div class='notes-body'>";
                notes += data[key].note;
            notes += "</div>";
        });
        $("#div_modal_objective_notes").html(notes);

    })
    .done(function() {

    })
    .fail(function() {
        alert("Failed to get objective notes");
    });
}

function fn_calculate_month(displayed_date, action) {
    var new_month = "";

    console.log("displayed_date" + displayed_date);

    if (action == "add") {
        new_month = displayed_date.add(1, 'month');
        current_last_day_of_month = displayed_date.add(1, 'month');
    } else if (action == "subtract") {
        new_month = displayed_date.subtract(1, 'month');
        current_last_day_of_month = displayed_date.subtract(1, 'month');
    }
    alert(new_month);
}

function fn_date_formatted (date_passed, format_style) {

    if (format_style == "for_display") {
        var formatted_date = dayjs(date_passed).format('MMMM YYYY');
    } else if (format_style == "for_db") {
        var formatted_date = dayjs(date_passed).endOf('month').format('YYYY-MM-DD');
    }
    return formatted_date;
}
