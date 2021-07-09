$(function () {

    table_movies = $('#movies').DataTable({ // JTables called in JavaScript so that it can run.
        "processing": true,
        "data": [],
        "columns": [
            {"data": "title"},
            {"data": "release"},
            {"data": "actors"},
            {"data": "director"},
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

    $("body").delegate("#show_netflix", "click", function (e) { //show table with all of the netflix movies.
        e.preventDefault();
        reload_table();
        reload_histogram();
    });

    $("body").delegate("#new_netflix_movie", "click", function (e) { //add a new netflix movie
        e.preventDefault();
        clear_edit_movie();
        $('#action').val("add");
        $('#edit_netflix').val("Insert");
        $('#edit').show();
    });


    // search movie by id and fill fields
    $("body").delegate("#edit_btn", "click", function (e) {

        e.preventDefault();
        var id = $(this).attr('movie');

        $('#action').val("edit");
        $('#edit_netflix').val("Edit");

        $.ajax({
            type: "GET", //get movie with id
            url: "http://localhost:8080/movies/netflix/" + id,
            success: function (movie) {
                $('#id').val(id);
                $('#title').val(movie.title);
                $('#release').val(movie.release);
                $('#actors').val(movie.actors);
                $('director').val(movie.director);
                $('#genre').val(movie.genre);
                $('#type').val(movie.type);
                $('#edit').show();
            },
            error: function (error) {
                console.log(error);
            }
        });
    });


    $("body").delegate("#edit_netflix", "click", function (e) {	//edit a netflix movie


        pelicula = {
            "id": $('#id').val(),
            "title": $('#title').val(),
            "release": $('#release').val(),
            "actors": $('#actors').val(),
            "director": $('#director').val(),
            "genre": $('#genre').val(),
            "type": $('#type').val()
        }

        if ($('#action').val() == 'edit') {

            console.log("editing!");

            $.ajax({
                type: "PUT",
                url: "http://localhost:8080/movies/netflix",
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
        } else if ($('#action').val() == 'add') {

            console.log("adding!");

            $.ajax({
                type: "POST",
                url: "http://localhost:8080/movies/netflix",
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

    // delete removes a film from the db
    $("body").delegate("#delete", "click", function (e) {

        e.preventDefault();

        var id = $(this).attr('movie');

        $.ajax({ //delete film
            type: "DELETE",
            url: "http://localhost:8080/movies/netflix/" + id,
            success: function (result) {
                console.log("show after delete");
                reload_table();
            },
            error: function (error) {
                console.log("Error...: " + JSON.stringify(error)); //deletes but shoots error
                reload_table();
            }
        });
    });

});

function reload_histogram() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/movies/netflix/histogram",
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

function reload_table() { //reload the table function

    $.ajax({
        type: "GET",
        url: "http://localhost:8080/movies/netflix",
        data: {"format": $('#format').val()},
        success: function (result) {
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
        },
        error: function (error) {
            $("#movies").html(error);
        }
    });

}

function clear_edit_movie() { //clear the edit form
    $('#id').val("-1");
    $('#title').val("");
    $('#release').val("");
    $('#actors').val("");
    $('#director').val("");
    $('#genre').val("");
    $('#type').val("");
}