// app/routes/index.tsx
import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CircleArrowRight } from 'lucide-react'
import { useRef, useState } from 'react'
import CardSection from '@/components/CardSection'
import { session, titleInfo } from './__root'
import { deleteCookie } from '@tanstack/react-start/server'

export const Route = createFileRoute('/')({
  component: Home,
  loader: () => {
    if (session.state.nickname) {
      throw redirect({ to: "/step2", search: { name: session.state.nickname } });
    } else {
      titleInfo.setState((state) => {
        return {
          ...state,
          name: undefined,
          type: "p",
          text: "Let's plan your travel!"
        }
      });
    }
  }
});

function Validation(name: string) {
  if (name.trim() === "" || !name) {
    return false;
  } else {
    return true;
  }
}

function Home() {
  const router = useRouter();
  const [warn, setWarn] = useState<boolean>(false);

  return (
    <CardSection>
      <h1 className="text-2xl">
        First of all,
        <Label htmlFor="name" className="text-2xl">tell your name to start.</Label>
      </h1>
      <p>Use unique nicknames before go to the next step.</p>
      <form onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = data.get("name");

        const res = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/auth/check-username?username=${name}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json"
          }
        });

        const result = await res.json();

        if (res.ok && result.is_available) {
          
          if (name && Validation(name.toString())) {
            router.navigate({
              viewTransition: true,
              to: "/step2",
              search: {
                name: name.toString()
              }
            })
          }
        } else {
          setWarn(true);
        }
      }} className="w-fit">
        <div className="flex gap-2">
          <Input type="text" name="name" placeholder="Name" className="text-lg" onChange={(e) => setWarn(!Validation(e.target.value))} />
          <Button type="submit" className="text-xl items-center">
            Next
            <CircleArrowRight />
          </Button>
        </div>
        {warn ? <p className="text-red-400 m-0.5">Your nickname is already exist or blank.</p> :null}
      </form>
      <Link to="/login" search={{ re_uri: "/" }} className="block text-cyan-600">Already have an account? Click here to login.</Link>
    </CardSection>
  )
}