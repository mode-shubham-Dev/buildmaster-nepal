<?php

namespace App\Support;

use App\Models\Notification;
use App\Models\User;

class Notify
{
    /**
     * Fire a notification to a single user. One line from any module.
     * Notify::send($user, 'leave.approved', 'Leave approved', 'Your annual leave was approved.', '/leave');
     */
    public static function send(User $user, string $type, string $title, ?string $body = null, ?string $link = null, ?string $icon = null): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type'    => $type,
            'title'   => $title,
            'body'    => $body,
            'link'    => $link,
            'icon'    => $icon,
        ]);
    }

    /** Fire the same notification to many users (e.g. all approvers). */
    public static function sendMany(iterable $users, string $type, string $title, ?string $body = null, ?string $link = null, ?string $icon = null): void
    {
        foreach ($users as $user) {
            self::send($user, $type, $title, $body, $link, $icon);
        }
    }
}