
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking chars (I, l, 1, O, 0)
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validates a room ID format
 * @param roomId - The room ID to validate
 * @returns true if the room ID is valid
 */
export function isValidRoomId(roomId: string): boolean {
  const roomCodeRegex = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/;
  return roomCodeRegex.test(roomId.toUpperCase());
}

/**
 * Formats a room ID for display (adds hyphens for readability)
 * @param roomId - The room ID to format
 * @returns Formatted room ID (e.g., "ABCD-EFGH")
 */
export function formatRoomId(roomId: string): string {
  const upperCaseRoomId = roomId.toUpperCase();
  if (upperCaseRoomId.length === 8) {
    return `${upperCaseRoomId.slice(0, 4)}-${upperCaseRoomId.slice(4)}`;
  }
  return upperCaseRoomId;
}
