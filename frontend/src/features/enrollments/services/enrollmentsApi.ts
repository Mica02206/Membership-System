import type { MemberStatus } from "@/features/check-in/types/status";
import { deleteMemberDirect, editMemberDirect, fetchMemberStatuses, fetchMemberStatusDirect, renewMemberPassDirect, uploadMemberPictureDirect } from "@/lib/memberData";

export const fetchMembers = (): Promise<MemberStatus[]> => fetchMemberStatuses();
export const fetchMemberStatus = (memberId: string): Promise<MemberStatus> => fetchMemberStatusDirect(memberId);
export const renewMemberPass = (memberId: string, days?: number): Promise<MemberStatus> => renewMemberPassDirect(memberId, days);
export const uploadMemberPictureApi = (memberId: string, picture: File): Promise<MemberStatus> => uploadMemberPictureDirect(memberId, picture);
export const editMemberApi = (memberId: string, fields: { fullName?: string; contact?: string; address?: string; packageName?: string; packageDays?: number; startedAt?: string }): Promise<MemberStatus> => editMemberDirect(memberId, fields);
export const deleteMemberApi = (memberId: string): Promise<void> => deleteMemberDirect(memberId);
