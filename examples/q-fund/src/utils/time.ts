import moment from "moment";
import { truncateNumber } from "./numberFunctions.ts";

export function formatTimestamp(timestamp: number): string {
  const now = moment();
  const timestampMoment = moment(timestamp);
  const elapsedTime = now.diff(timestampMoment, "minutes");

  if (elapsedTime < 1) {
    return "Just now";
  } else if (elapsedTime < 60) {
    return `${elapsedTime}m`;
  } else if (elapsedTime < 1440) {
    return `${Math.floor(elapsedTime / 60)}h`;
  } else {
    return timestampMoment.format("MMM D");
  }
}

export function formatTimestampSeconds(timestamp: number): string {
  const now = moment();
  const timestampMoment = moment.unix(timestamp);
  const elapsedTime = now.diff(timestampMoment, "minutes");

  if (elapsedTime < 1) {
    return "Just now";
  } else if (elapsedTime < 60) {
    return `${elapsedTime}m`;
  } else if (elapsedTime < 1440) {
    return `${Math.floor(elapsedTime / 60)}h`;
  } else {
    return timestampMoment.format("MMM D");
  }
}

export const formatDate = (unixTimestamp: number): string => {
  const date = moment(unixTimestamp, "x").fromNow();

  return date;
};
export const formatDateSeconds = (unixTimestamp: number): string => {
  const date = moment.unix(unixTimestamp).fromNow();

  return date;
};

export type DayTime = { days: number; hours: number; minutes: number };

export interface SummaryTransactionCounts {
  arbitrary: number;
  AT: number;
  deployAt: number;
  groupInvite: number;
  joinGroup: number;
  message: number;
  payment: number;
  registerName: number;
  rewardShare: number;
  updateName: number;
  voteOnPoll: number;
}
export interface DaySummaryResponse {
  assetsIssued: number;
  blockCount: number;
  namesRegistered: number;
  totalTransactionCount: number;
  transactionCountByType: SummaryTransactionCounts;
}

export const getDaySummary = async () => {
  return (await qortalRequest({
    action: "GET_DAY_SUMMARY",
  })) as DaySummaryResponse;
};

export const getDurationFromBlocks = async (blocks: number) => {
  return getDaySummary().then(response => {
    const minutesPerDay = 60 * 24;
    const blocksPerMinute = response.blockCount / minutesPerDay;
    const duration = blocks / blocksPerMinute;

    const days = Math.floor(duration / minutesPerDay);
    const hours = Math.floor((duration % minutesPerDay) / 60);
    const minutes = Math.floor(duration % 60);

    return { days, hours, minutes } as DayTime;
  });
};

export const getBlocksInDuration = async (minutes: number) => {
  return getDaySummary().then(response => {
    const minutesPerDay = 60 * 24;
    const blocksPerMinute = response.blockCount / minutesPerDay;
    const blocksInDuration = minutes * blocksPerMinute;
    return +truncateNumber(Math.abs(blocksInDuration), 0);
  });
};
