@extends('layouts.portal')

@section('title', 'Property Requests')

@section('content')
    @livewire('property.property-list', ['title' => 'Property Stock'])
@endsection
