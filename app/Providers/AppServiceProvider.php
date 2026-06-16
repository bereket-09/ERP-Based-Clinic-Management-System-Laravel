<?php

namespace App\Providers;

use Illuminate\Routing\UrlGenerator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use App\Models\Visit;
use App\Models\LabOrder;
use App\Models\DrugOrder;
use App\Models\WorkLeave;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(UrlGenerator $url)
    {
        if (env('APP_ENV') == 'production') {
            $url->forceScheme('https');
        }

        // Share role-aware navigation counts (badges + notifications) with the
        // navbar and every role sidebar. Computed per request; no realtime needed.
        View::composer(
            ['navbar', 'admin.sidebar', 'doctor.sidebar', 'lab.sidebar', 'pharmacy.sidebar', 'reception.sidebar'],
            function ($view) {
                $view->with('navCounts', self::navCounts());
            }
        );
    }

    /**
     * Build the badge/notification counts for the current user's role.
     */
    public static function navCounts(): array
    {
        $c = [];
        if (! Auth::check()) {
            return $c;
        }
        $role = (string) Auth::user()->role;
        $uid = Auth::id();

        try {
            if ($role === '1') {            // Doctor
                $c['queued']   = Visit::where('statues', 'Queued')->where('doc_id', $uid)->count();
                $c['labReady'] = Visit::where('statues', 'Lab Result Completed')->where('doc_id', $uid)->count();
            } elseif ($role === '0') {      // Reception
                $c['queued']    = Visit::where('statues', 'Queued')->count();
                $c['completed'] = Visit::where('statues', 'Completed')->count();
            } elseif ($role === '2') {      // Labratorist
                $c['labQueue']   = LabOrder::where('status', 'Queued')->count();
                $c['labPending'] = LabOrder::where('status', 'Pending')->count();
            } elseif ($role === '3') {      // Pharmacist
                $c['drugNew']     = DrugOrder::where('status', 'Queued')->count();
                $c['drugPending'] = DrugOrder::where('status', 'Pending')->count();
            } elseif ($role === '4') {      // Manager / Admin
                $c['leaves'] = WorkLeave::where('status', 'Pending')->count();
            }
        } catch (\Throwable $e) {
            // Never let a count query break the whole layout.
            return $c;
        }

        $c['total'] = array_sum($c);

        return $c;
    }
}
