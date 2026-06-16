{{-- Soft on-leave notice. Self-computing: renders nothing unless the logged-in
     user is on an approved leave whose date range covers today. Never blocks. --}}
@php($leaveToday = \Auth::check() ? \App\Models\WorkLeave::where('u_id', \Auth::id())->whereIn('status', ['Accepted', 'Approved', 'Return Requested'])->whereDate('from', '<=', now()->toDateString())->whereDate('to', '>=', now()->toDateString())->orderByDesc('id')->first() : null)

@if ($leaveToday)
    @php($returnPending = $leaveToday->status === 'Return Requested')
    <div class="leave-notice card {{ $returnPending ? 'is-amber' : '' }}" role="status">
        <div class="leave-notice-body">
            <span class="leave-notice-icon"><i class="fa fa-{{ $returnPending ? 'hourglass-half' : 'calendar-check-o' }}"></i></span>
            <div class="leave-notice-text">
                @if ($returnPending)
                    <strong>Return request sent — awaiting admin approval</strong>
                    <span class="leave-notice-sub">You requested an early return from your approved leave.</span>
                @else
                    <strong>You're on approved leave until {{ \Carbon\Carbon::parse($leaveToday->to)->format('d M Y') }}.</strong>
                    <span class="leave-notice-sub">Need to come back sooner? Send an early-return request to admin.</span>
                @endif
            </div>
            @if ($returnPending)
                <span class="leave-pill"><i class="fa fa-clock-o"></i> Pending approval</span>
            @else
                <form action="{{ url('/leave/' . $leaveToday->id . '/request-return') }}" method="POST" class="leave-notice-action">
                    @csrf
                    <button type="submit" class="btn btn-sm btn-primary"><i class="fa fa-sign-in"></i> Request early return</button>
                </form>
            @endif
        </div>
    </div>

    <style>
        .leave-notice { border: 1px solid rgba(22,160,133,.35); border-left: 4px solid #16a085; background: #f3faf8; box-shadow: none; margin-bottom: 18px; }
        .leave-notice.is-amber { border-color: rgba(243,156,18,.4); border-left-color: #f39c12; background: #fdf6ec; }
        .leave-notice-body { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 14px 18px; }
        .leave-notice-icon { width: 40px; height: 40px; min-width: 40px; border-radius: 50%; display: grid; place-items: center; background: #16a085; color: #fff; font-size: 17px; }
        .leave-notice.is-amber .leave-notice-icon { background: #f39c12; }
        .leave-notice-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
        .leave-notice-text strong { color: #0f5e50; font-size: 14.5px; }
        .leave-notice.is-amber .leave-notice-text strong { color: #8a5b00; }
        .leave-notice-sub { font-size: 12.5px; color: #5b6b67; margin-top: 2px; }
        .leave-notice-action { margin: 0; }
        .leave-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #8a5b00; background: #fcefd4; border-radius: 999px; padding: 5px 12px; }
    </style>
@endif
