<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\ActionCenterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(protected ActionCenterService $actionCenter) {}

    /** Recent stored notifications + unread count + live action items. */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->appNotifications()->latest()->limit(30)->get();
        $unreadCount = $user->appNotifications()->unread()->count();
        $actions = $this->actionCenter->forUser($user);

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
            'actions'       => $actions,
        ]);
    }

    /** Lightweight badge poll — just the counts. */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'unread_count' => $user->appNotifications()->unread()->count(),
            'action_count' => collect($this->actionCenter->forUser($user))->sum('count'),
        ]);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);
        $notification->update(['read_at' => now()]);
        return response()->json(['message' => 'Marked read.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->appNotifications()->unread()->update(['read_at' => now()]);
        return response()->json(['message' => 'All marked read.']);
    }
}