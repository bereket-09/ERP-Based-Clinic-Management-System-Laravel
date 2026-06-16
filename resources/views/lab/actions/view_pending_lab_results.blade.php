@extends('layouts.portal')

@section('title', 'Pending Lab Results')

@section('content')
    @livewire('lab.lab-order-list', [
        'status' => 'Pending',
        'title' => 'Pending Lab Results',
        'actionLabel' => 'Edit results',
    ])
@endsection
