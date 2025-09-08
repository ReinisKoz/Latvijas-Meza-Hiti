<!DOCTYPE html>
<html>
    <head>
        <title>Laravel</title>
        @vite(['resources/js/app.js'])
        <script src="{{ asset('resources/js/scripts.js') }}"></script>
    </head>
    <body>
        <div id="app">
            <example-component></example-component>
        </div>
    </body>
</html>
