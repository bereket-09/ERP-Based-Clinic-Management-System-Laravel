@extends('layouts.portal')

@section('title', 'Edit Department')

@section('content')
    @livewire('departments.department-form', ['departmentId' => $data->id])
@endsection
