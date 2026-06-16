@extends('layouts.portal')

@section('title', 'Lab Results Ready')

@section('content')
    @livewire('patients.visit-list', ['status' => 'Lab Result Completed', 'title' => 'Lab Results Ready'])
@endsection
