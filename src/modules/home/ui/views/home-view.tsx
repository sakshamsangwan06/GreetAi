"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { text } from "stream/consumers";

export const HomeView = () => {
   const trpc = useTRPC();
   const{data} = useQuery(trpc.hello.queryOptions({text: "SAKSHAM SANGWAN"}))

  return (
    <div className="flex flex-col p-4 gap-4">
      {data?.greeting}
    </div>
  );
};


// "use client";
// import {Button} from "@/components/ui/button";
// import {authClient} from "@/lib/auth-client";

// import {useRouter} from "next/navigation";


// export const HomeView = () => {
//     const router = useRouter();
//   const {data: session} = authClient.useSession();
//   if (!session) {
//     return(
//       <p>Loading...</p>
//     )
//   }
//   return (
//     <div className="flex flex-col p-4 gap-4">
//       <p>Logged in as {session.user.name}</p>
//       <Button onClick={() => authClient.signOut({
//         fetchOptions :{
//             onSuccess: () => router.push("/sign-in")
//          }
//     })
//         }>
//         Sign Out
//         </Button>
//     </div>
//   );
// }

