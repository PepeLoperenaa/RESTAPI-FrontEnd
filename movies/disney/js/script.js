$(function () {

    table_movies = $('#movies').DataTable({ // JTables called in JavaScript so that it can run.
        "processing": true,
        "data": [],
        "columns": [
            {"data": "title"},
            {"data": "release"},
            {"data": "actors"},
            {"data": "director"},
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

    $("body").delegate("#show_disney", "click", function (e) { //show the table with all of the results.
        e.preventDefault();
        reload_table();
		reload_histogram();
    });

    $("body").delegate("#new_disney_movie", "click", function (e) {
        e.preventDefault();	//prevent blank page.
        clear_edit_movie(); //function clearing the edit form
        $('#action').val("add"); //start the adding
        $('#edit_disney').val("Insert"); //get the form with the insert
        $('#edit').show(); //show the form
    });

    // search movie by id and fill fields
    $("body").delegate("#edit_btn", "click", function (e) {

        e.preventDefault();
        var id = $(this).attr('movie'); //getting the id of the movie chosen.

        $('#action').val("edit");
        $('#edit_disney').val("Edit");

        $.ajax({ //getting values in Ajax
            type: "GET",
            url: "http://localhost:8080/movies/disney/" + id, //API url where the data will be done.
            success: function (movie) {	//If it is working show this.
                $('#id').val(id);
                $('#title').val(movie.title);
                $('#release').val(movie.release);
                $('#actors').val(movie.actors);
                $('#director').val(movie.director);
                $('#rating').val(movie.rating);
                $('#genre').val(movie.genre);
                $('#type').val(movie.type);
                $('#edit').show();
            },
            error: function (error) {
                console.log(error); //show an error if this does not work.
            }
        });
    });


    $("body").delegate("#edit_disney", "click", function (e) {	//editing the disney films.


        pelicula = { //Getting the film for edit.
            "id": $('#id').val(),
            "title": $('#title').val(),
            "release": $('#release').val(),
            "actors": $('#actors').val(),
            "director": $('#director').val(),
            "rating": $('#rating').val(),
            "genre": $('#genre').val(),
            "type": $('#type').val()
        }

        if ($('#action').val() == 'edit') { //if we are editing POST the change on DB via the API

            console.log("editing!"); //as it is the same form, if we choose edition then...

            $.ajax({
                type: "PUT",
                url: "http://localhost:8080/movies/disney",
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

            console.log("Adding!"); //if we choose the add a new film then do this.

            $.ajax({
                type: "POST",
                url: "http://localhost:8080/movies/disney",
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

    // delete removes
    $("body").delegate("#delete", "click", function (e) {	//Deletion

        e.preventDefault(); //preventing default of the website.

        var id = $(this).attr('movie'); //choosing the specific movie to delete.
        //console.log(id);

        $.ajax({ //deleting the film
            type: "DELETE",
            url: "http://localhost:8080/movies/disney/" + id,
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
        url: "http://localhost:8080/movies/disney/histogram",
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


function reload_table() { //functioning to reload the table and website

    $.ajax({
        type: "GET",
        url: "http://localhost:8080/movies/disney",
        data: {"format": $('#format').val()},
        success: function (result) {
            if ($('#format').val() == 'xml') {
                // check xml
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
            console.log("Error...: " + JSON.stringify(error));
        }
    });

}

function clear_edit_movie() { //clear the form when we finish editing.
    $('#id').val("-1");
    $('#title').val("");
    $('#release').val("");
    $('#actors').val("");
    $('#director').val("");
    $('#rating').val("");
    $('#genre').val("");
    $('#type').val("");
}