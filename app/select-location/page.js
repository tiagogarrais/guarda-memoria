import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import LocationSelector from "../components/LocationSelector";

const prisma = new PrismaClient();

export default async function SelectLocationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Selecione sua localização
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Escolha o estado e cidade onde você mora
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LocationSelector
            currentLocation={currentLocation}
            allowAutoRedirect={!currentLocation}
          />
        </div>
      </div>
    </div>
  );
}
