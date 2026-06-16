@extends('layouts.portal')

@section('title', 'Pharmacists')

@section('content')
    @livewire('staff.staff-list', ['role' => '3', 'title' => 'Pharmacists'])
@endsection
