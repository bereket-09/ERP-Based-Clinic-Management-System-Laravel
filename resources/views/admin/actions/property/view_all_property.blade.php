@extends('layouts.portal')

@section('title', 'All Property')

@section('content')
    @livewire('property.property-list', ['title' => 'All Property'])
@endsection
