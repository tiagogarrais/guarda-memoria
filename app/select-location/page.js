import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import LocationSelector from "../components/LocationSelector";

const prisma = new PrismaClient();

export default async function SelectLocationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Buscar localização atual do usuário
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { stateId: true, cityId: true },
  });

  let currentLocation = null;
  if (user?.stateId && user?.cityId) {
    // Buscar nome da cidade atual
    const cityData = await prisma.city.findUnique({
      where: { id: user.cityId },
      select: { id: true, name: true },
    });

    if (cityData) {
      currentLocation = {
        stateId: user.stateId,
        cityId: user.cityId,
        cityName: cityData.name,
      };
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LocationSelector currentLocation={currentLocation} />
    </div>
  );
}
