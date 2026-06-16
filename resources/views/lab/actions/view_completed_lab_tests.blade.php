@extends('layouts.portal')

@section('title', 'Completed Lab Tests')

@section('content')
    @livewire('lab.lab-order-list', [
        'status' => 'Completed',
        'title' => 'Completed Lab Tests',
        'actionLabel' => 'Edit results',
    ])
@endsection
