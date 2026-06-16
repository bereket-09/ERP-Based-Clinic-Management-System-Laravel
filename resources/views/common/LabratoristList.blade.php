@extends('layouts.portal')

@section('title', 'Labratorists')

@section('content')
    @livewire('staff.staff-list', ['role' => '2', 'title' => 'Labratorists'])
@endsection
