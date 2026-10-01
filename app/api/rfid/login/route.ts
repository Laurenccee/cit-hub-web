import { NextRequest, NextResponse } from "next/server";

const USERS = [
  {
    cardUid: "1652386820",
    name: "Ronyessa Jane",
    role: "Admin",
  },
  {
    cardUid: "1768842244",
    name: "Laurence Tejada",
    role: "User",
  },
];

let logs: Array<{
  id: string;
  cardUid: string;
  userName: string;
  userRole: string;
  status: string;
  timestamp: string;
}> = [];

export async function GET() {
  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  try {
    const { cardUid } = await req.json();

    if (!cardUid) {
      return NextResponse.json(
        { message: "Card UID is required" },
        { status: 400 },
      );
    }

    const user = USERS.find((u) => u.cardUid === cardUid);

    const logEntry = {
      id: Date.now().toString(),
      cardUid,
      userName: user?.name ?? "Unknown",
      userRole: user?.role ?? "N/A",
      status: user ? "SUCCESS" : "FAILED",
      timestamp: new Date().toISOString(),
    };

    logs.unshift(logEntry);
    if (logs.length > 100) logs = logs.slice(0, 100);

    if (user) {
      return NextResponse.json({ user });
    } else {
      return NextResponse.json({ message: "Invalid Card" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}