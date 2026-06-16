@extends('layouts.portal')

@section('title', 'Expired Medicines')

@section('content')
    @livewire('pharmacy.medicine-list', ['filter' => 'expired', 'title' => 'Expired Medicines List'])
@endsection
