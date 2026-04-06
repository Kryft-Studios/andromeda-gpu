(module
   (func $add (param $a i32) (param $b i32) (result i32)
      local.get $a
      local.get $b
      i32.add
   (export "add" (func $add)))
   (func $sub (param $c i32) (param $d i32) (result i32)
      local.get $c
      local.get $d
      i32.sub
   )
)