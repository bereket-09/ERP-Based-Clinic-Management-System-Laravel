@extends('layouts.portal')

@section('title', 'Doctors')

@section('content')
    @livewire('staff.staff-list', ['role' => '1', 'title' => 'Doctors'])
@endsection
