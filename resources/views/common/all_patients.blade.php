@extends('layouts.portal')

@section('title', 'All Patients')

@section('content')
    @livewire('patients.patient-list')
@endsection
