@extends('layouts.portal')

@section('title', 'Ordered Lab Tests')

@section('content')
    @livewire('lab.lab-order-list', [
        'status' => 'Queued',
        'title' => 'Ordered Lab Tests',
        'actionLabel' => 'Start test',
    ])
@endsection
