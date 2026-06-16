@extends('layouts.portal')

@section('title', 'In-Stock Medicines')

@section('content')
    @livewire('pharmacy.medicine-list', ['filter' => 'instock', 'title' => 'In-Stock Medicines List'])
@endsection
