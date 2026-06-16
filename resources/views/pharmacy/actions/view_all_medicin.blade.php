@extends('layouts.portal')

@section('title', 'All Medicines')

@section('content')
    @livewire('pharmacy.medicine-list', ['filter' => 'all', 'title' => 'All Medicines List'])
@endsection
