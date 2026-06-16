@extends('layouts.portal')

@section('title', 'Completed Treatment')

@section('content')
    @livewire('patients.visit-list', ['status' => 'Completed', 'title' => 'Completed Treatment'])
@endsection
