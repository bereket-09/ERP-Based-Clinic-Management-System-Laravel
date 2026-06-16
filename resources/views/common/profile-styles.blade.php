<style>
    .profile-shell { max-width: 980px; margin: 0 auto; }

    /* Cover band */
    .profile-cover {
        position: relative;
        background: var(--c-surface, #fff);
        border: 1px solid var(--c-border, #e6ecf1);
        border-radius: calc(var(--radius, 14px) + 4px);
        box-shadow: 0 10px 30px -12px rgba(22, 160, 133, .25), var(--shadow-sm, 0 1px 2px rgba(0,0,0,.04));
        overflow: hidden;
        margin-bottom: 1.75rem;
    }
    .profile-cover-band {
        height: 132px;
        background: linear-gradient(100deg, var(--c-primary, #16a085), var(--c-primary-700, #0e6b59));
        position: relative;
    }
    .profile-cover-band::after {
        content: "";
        position: absolute; inset: 0;
        background: radial-gradient(circle at 85% -20%, rgba(255,255,255,.18), transparent 55%);
    }
    .profile-cover-body {
        display: flex;
        align-items: flex-end;
        gap: 1.25rem;
        padding: 0 1.75rem 1.5rem;
        flex-wrap: wrap;
    }
    .profile-avatar-wrap { margin-top: -56px; flex: 0 0 auto; }
    .profile-avatar {
        width: 116px; height: 116px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid var(--c-surface, #fff);
        box-shadow: 0 8px 22px -8px rgba(14, 107, 89, .45);
        background: var(--c-surface, #fff);
    }
    .profile-identity { flex: 1 1 260px; padding-top: .85rem; min-width: 0; }
    .profile-name {
        font-size: 1.7rem;
        font-weight: 800;
        letter-spacing: -.02em;
        color: var(--c-ink, #1f2d3a);
        margin: 0 0 .35rem;
        line-height: 1.15;
    }
    .profile-role { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; margin-bottom: .7rem; }
    .profile-role-tag {
        font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
        color: var(--c-primary-700, #0e6b59);
        background: var(--c-primary-50, #e8f6f2);
        border: 1px solid var(--c-primary-100, #d2efe7);
        padding: .22rem .6rem; border-radius: var(--radius-pill, 999px);
    }
    .profile-speciality { font-size: .9rem; color: var(--c-ink-soft, #51616f); }
    .profile-chips { display: flex; flex-wrap: wrap; gap: .5rem; }
    .profile-chip {
        display: inline-flex; align-items: center; gap: .4rem;
        font-size: .82rem; color: var(--c-ink-soft, #51616f);
        background: var(--c-primary-50, #f1f7f5);
        border: 1px solid var(--c-border, #e6ecf1);
        padding: .3rem .7rem; border-radius: var(--radius-pill, 999px);
        transition: transform .15s ease, box-shadow .15s ease, color .15s ease;
    }
    .profile-chip i { color: var(--c-primary, #16a085); }
    .profile-chip:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,.08)); color: var(--c-ink, #1f2d3a); }
    .profile-cover-actions { padding-top: .85rem; flex: 0 0 auto; align-self: center; }

    /* Tabs */
    .profile-tabs-card { border-radius: calc(var(--radius, 14px) + 4px); overflow: hidden; }
    .profile-nav {
        border-bottom: 1px solid var(--c-border, #e6ecf1);
        padding: .35rem .9rem 0;
        background: var(--c-primary-50, #f6fbfa);
    }
    .profile-nav .nav-link {
        border: 0; background: transparent;
        color: var(--c-ink-soft, #51616f);
        font-weight: 600; font-size: .92rem;
        padding: .8rem 1.05rem;
        border-bottom: 2.5px solid transparent;
        border-radius: 0;
        transition: color .15s ease, border-color .15s ease;
    }
    .profile-nav .nav-link i { margin-right: .35rem; }
    .profile-nav .nav-link:hover { color: var(--c-primary-700, #0e6b59); }
    .profile-nav .nav-link.active {
        color: var(--c-primary-700, #0e6b59);
        background: transparent;
        border-bottom-color: var(--c-primary, #16a085);
    }
    .profile-tab-content { padding: 1.6rem 1.75rem 1.9rem; }
    .profile-section-title { font-size: 1.12rem; font-weight: 700; color: var(--c-ink, #1f2d3a); margin-bottom: 1.1rem; }
    .profile-section-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.2rem; flex-wrap: wrap; }

    /* Definition list */
    .profile-dl { margin: 0; }
    .profile-dl-row {
        display: grid; grid-template-columns: 200px 1fr; gap: 1rem;
        padding: .7rem 0;
        border-bottom: 1px solid var(--c-border, #eef2f5);
        animation: profileFade .4s ease both;
    }
    .profile-dl-row:last-child { border-bottom: 0; }
    .profile-dl-row dt { color: var(--c-ink-muted, #8696a4); font-weight: 600; font-size: .85rem; margin: 0; }
    .profile-dl-row dd { color: var(--c-ink, #1f2d3a); font-weight: 600; margin: 0; word-break: break-word; }
    .tnum { font-variant-numeric: tabular-nums; }

    /* Timeline */
    .profile-timeline { list-style: none; margin: 0; padding: 0 0 0 .25rem; position: relative; }
    .profile-timeline::before {
        content: ""; position: absolute; left: 6px; top: 6px; bottom: 6px;
        width: 2px; background: var(--c-primary-100, #d2efe7);
    }
    .profile-timeline-item {
        position: relative; padding: 0 0 1.4rem 1.85rem;
        animation: profileFade .45s ease both;
    }
    .profile-timeline-item:last-child { padding-bottom: 0; }
    .profile-timeline-dot {
        position: absolute; left: 0; top: 4px;
        width: 14px; height: 14px; border-radius: 50%;
        background: var(--c-surface, #fff);
        border: 3px solid var(--c-primary, #16a085);
        box-shadow: 0 0 0 4px var(--c-primary-50, #e8f6f2);
    }
    .profile-timeline-body {
        background: var(--c-surface, #fff);
        border: 1px solid var(--c-border, #e6ecf1);
        border-radius: var(--radius, 12px);
        padding: .85rem 1.05rem;
        transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
    }
    .profile-timeline-body:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -14px rgba(22, 160, 133, .4);
        border-color: var(--c-primary-100, #d2efe7);
    }
    .profile-timeline-title { font-weight: 700; color: var(--c-ink, #1f2d3a); font-size: 1rem; }
    .profile-timeline-sub { color: var(--c-ink-soft, #51616f); font-size: .9rem; margin-top: .15rem; }
    .profile-timeline-time { color: var(--c-ink-muted, #8696a4); font-size: .82rem; margin-top: .35rem; }
    .profile-badge {
        display: inline-block; margin-left: .4rem;
        font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
        color: var(--c-primary-700, #0e6b59);
        background: var(--c-primary-50, #e8f6f2);
        border-radius: var(--radius-pill, 999px);
        padding: .12rem .5rem; vertical-align: middle;
    }

    /* Staggered fade-in */
    @keyframes profileFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .profile-dl-row:nth-child(2) { animation-delay: .03s; }
    .profile-dl-row:nth-child(3) { animation-delay: .06s; }
    .profile-dl-row:nth-child(4) { animation-delay: .09s; }
    .profile-dl-row:nth-child(5) { animation-delay: .12s; }
    .profile-dl-row:nth-child(6) { animation-delay: .15s; }
    .profile-dl-row:nth-child(n+7) { animation-delay: .18s; }
    .profile-timeline-item:nth-child(2) { animation-delay: .06s; }
    .profile-timeline-item:nth-child(3) { animation-delay: .12s; }
    .profile-timeline-item:nth-child(n+4) { animation-delay: .18s; }

    @media (max-width: 575px) {
        .profile-cover-body { padding: 0 1.1rem 1.2rem; }
        .profile-tab-content { padding: 1.2rem 1.1rem 1.4rem; }
        .profile-dl-row { grid-template-columns: 1fr; gap: .15rem; }
        .profile-cover-actions { width: 100%; }
        .profile-cover-actions .btn { width: 100%; }
    }
</style>
