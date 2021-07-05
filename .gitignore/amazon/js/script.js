$(function () {


    table_movies = $('#movies').DataTable({ // JTables called in JavaScript so that it can run.
        "processing": true,
        "data": [],
        "columns": [
            {"data": "title"},
            {"data": "release"},
            {"data": "rating"},
            {"data": "genre"},
            {"data": "type"},
            {
                "render": function (data, type, row, meta) {
                    var html = "<a href='' id='delete' movie=" + row.id + ">Delete</a>&nbsp"; //deleting the movie with the button on the table.
                    html += "<a href='' id='edit_btn' movie=" + row.id + ">Edit</a>&nbsp"; //Get to the edit page with values included.
                    return html;
                }
            }
        ]
    });

    // hide edit form initially
    $('#edit').hide();


    $("body").delegate("#show_amazon", "click", function (e) {
        e.preventDefault();
        reload_table();
    });

    $("body").delegate("#show_amazon_histogram", "click", function (e) {
        e.preventDefault();
        //reload_table();
        reload_histogram();
    });

    $("body").delegate("#new_amazon_movie", "click", function (e) {
        e.preventDefault();
        clear_edit_movie();
        $('#action').val("add");
        $('#edit_amazon').val("Insert");
        $('#edit').show();
    });


    // search movie by id and fill fields
    $("body").delegate("#edit_btn", "click", function (e) {

        e.preventDefault();
        var id = $(this).attr('movie'); //getting the id of the movie chosen.

        $('#action').val("edit");
        $('#edit_amazon').val("Edit");

        $.ajax({ //getting values in Ajax
            type: "GET",
            url: "http://localhost:8080/movies/amazon/" + id, //API url where the data will be done.
            statusCode: {
                200: function (movie) {
                    $('#id').val(id);
                    $('#title').val(movie.title);
                    $('#release').val(movie.release);
                    $('#rating').val(movie.rating);
                    $('#genre').val(movie.genre);
                    $('#type').val(movie.type);
                    $('#edit').show();
                }
            },
            error: function (error) {
                console.log(error);
            }
        });
    });


    $("body").delegate("#edit_amazon", "click", function (e) {


        pelicula = { //Getting the film for edit.
            "id": $('#id').val(),
            "title": $('#title').val(),
            "release": $('#release').val(),
            "rating": $('#rating').val(),
            "genre": $('#genre').val(),
            "type": $('#type').val()
        }

        if ($('#action').val() == 'edit') {

            console.log("Editing!");

            $.ajax({
                type: "PUT",
                url: "http://localhost:8080/movies/amazon",
                data: JSON.stringify(pelicula),
                contentType: "application/json; charset=utf-8",
                statusCode: {
                    200: function (e) {
                        console.log(e.responseText);
                        reload_table();
                        // hide edit form after successful edit
                        clear_edit_movie();
                        $('#edit').hide();
                    },
                    500: function (e) {
                        console.log(e.responseText);
                    }
                }
            });
        } else if ($('#action').val() == 'add') { //if the action of the form is adding a film

            console.log("Adding!");

            $.ajax({
                type: "POST",
                url: "http://localhost:8080/movies/amazon",
                data: JSON.stringify(pelicula),
                contentType: "application/json; charset=utf-8",
                statusCode: {
                    200: function (e) {
                        console.log(e.message);
                        reload_table();
                        // hide edit form after successful edit
                        clear_edit_movie();
                        $('#edit').hide();
                        $('#status').html("<b><font color='green'>" + e.message + "</font></b>")
                    },
                    500: function (e) {
                        $('#status').html("<b><font color='red'>" + e.message + "</font></b>");
                    }
                }
            });
        }

    });

    // delete removes a film from DB
    $("body").delegate("#delete", "click", function (e) {

        e.preventDefault();

        var id = $(this).attr('movie');
        //console.log(id);

        $.ajax({
            type: "DELETE",
            url: "http://localhost:8080/movies/amazon/" + id,
            dataType: "text",
            statusCode: {
                200: function (e) {
                    console.log("show after delete");
                    reload_table();
                }
            },
            error: function (error) {
                console.log("Error...: " + JSON.stringify(error));
            }
        });
    });

});

function reload_histogram() {

    $.ajax({
        type: "GET",
        url: "http://localhost:8080/movies/amazon/histogram",
        data: {"format": $('#format').val()},
        statusCode: {
            200: function (result) {
                if ($('#format').val() == 'xml') {
                    // mirarlo
                    result = xmlToJson(result);
                    //result = JSON.parse(result);
                    result = result.List.item;
                    console.log(result);
                }

                console.log(result);

                var data = [];
                $.each(result, function (genre, val) {
                    console.log(genre + "," + val);
                    data.push({label: genre, value: val});
                });

                // Chart Specifications
                var targetId = 'chart';
                var canvasWidth = 1000;
                var canvasHeight = 450;

                // Create Chart
                var chart = new BarChart(targetId, canvasWidth, canvasHeight, data);
            }
        },
        error: function (error) {
            $("#movies").html(error);
        }
    });
}

function reload_table() { //reloading the table with updated results.

    $.ajax({
        type: "GET",
        url: "http://localhost:8080/movies/amazon",
        data: {"format": $('#format').val()},
        statusCode: {
            200: function (result) {
                if ($('#format').val() == 'xml') {
                    // mirarlo
                    result = xmlToJson(result);
                    //result = JSON.parse(result);
                    result = result.List.item;
                    console.log(result);
                }

                table_movies.clear().draw();
                result.forEach(row => {
                    table_movies.row.add(row).draw();
                });

                console.log("show");
            }
        },
        error: function (error) {
            $("#movies").html(error);
        }
    });

}

function clear_edit_movie() { //clear the form when we finish editing.
    $('#id').val("-1");
    $('#title').val("");
    $('#release').val("");
    $('#rating').val("");
    $('#genre').val("");
    $('#type').val("");
}

// trying to get the tables working
/*
$("body").delegate("#try","click", function(e){

    e.preventDefault();
    $.ajax({
            type: "GET",
            url: "http://localhost:8080/movies/amazon/histogram",
            success: function(result) {
                var array = [];
                for(let i=0;i<result.length;i++) {

                    array[i] = [result[i]]

                }
            },
            error: function(error) {
                alert("Error: " + error);
            }
    });
});
*/
