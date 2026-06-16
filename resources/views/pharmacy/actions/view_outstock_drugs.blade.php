@extends('layouts.portal')

@section('title', 'Out-of-Stock Medicines')

@section('content')
    @livewire('pharmacy.medicine-list', ['filter' => 'outstock', 'title' => 'Out-of-Stock Medicines List'])
@endsection
