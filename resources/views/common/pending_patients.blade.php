@extends('layouts.portal')

@section('title', 'Pending Patients')

@section('content')
    @livewire('patients.visit-list', ['status' => 'Pending', 'title' => 'Pending Patients'])
@endsection
