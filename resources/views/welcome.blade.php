<!DOCTYPE html>
<html>
<head>
    <title>Laravel Vite</title>
    @vite(['resources/js/app.js'])
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <div id="app">
        <example-component></example-component>
    </div>
</body>
</html>