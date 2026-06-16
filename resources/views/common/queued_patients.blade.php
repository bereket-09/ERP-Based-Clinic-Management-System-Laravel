@extends('layouts.portal')

@section('title', 'Queued Patients')

@section('content')
    @livewire('patients.visit-list', ['status' => 'Queued', 'title' => 'Queued Patients'])
@endsection
