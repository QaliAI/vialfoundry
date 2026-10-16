// Supabase-shaped boundary for isolated SQL integration tests. All values are
// bound parameters; identifiers must be selected from the actual test schema.
export function sqlClient(db) {
  const ident=x=>{if(!/^[a-z_][a-z0-9_]*$/i.test(x))throw Error('Invalid identifier');return '"'+x+'"';};
  return {
    rpc:async(name,params={})=>{
      try {
        const entries=Object.entries(params);const r=await db.query(`select ${ident(name)}(${entries.map(([k],i)=>`${ident(k)} => $${i+1}`).join(',')}) result`,entries.map(([,v])=>v));
        return {data:r.rows[0].result,error:null};
      } catch(error){return {data:null,error};}
    },
    from:table=>{
      const state={where:[],values:[],select:'*',operation:'select'};
      const bind=value=>{state.values.push(value);return '$'+state.values.length;};
      const builder={
        select:(cols='*')=>{state.select=cols;return builder;},
        eq:(col,value)=>{state.where.push(`${ident(col)}=${bind(value)}`);return builder;},
        neq:(col,value)=>{state.where.push(`${ident(col)}<>${bind(value)}`);return builder;},
        ilike:(col,value)=>{state.where.push(`${ident(col)} ILIKE ${bind(value)}`);return builder;},
        is:(col,value)=>{if(value!==null)throw Error('Only null supported');state.where.push(`${ident(col)} IS NULL`);return builder;},
        order:col=>{state.order=ident(col);return builder;},
        insert:values=>{state.operation='insert';state.rows=Array.isArray(values)?values:[values];return builder;},
        update:values=>{state.operation='update';state.update=values;return builder;},
        single:()=>run(true),maybeSingle:()=>run(true),then:(resolve,reject)=>run(false).then(resolve,reject),
      };
      async function run(single) {
        try {
          let sql;const tableName=ident(table);
          const selected=state.select==='*'?'*':state.select.split(',').map(x=>ident(x.trim())).join(',');
          if(state.operation==='select')sql=`select ${selected} from ${tableName}`;
          else if(state.operation==='insert') {
            const cols=Object.keys(state.rows[0]);sql=`insert into ${tableName}(${cols.map(ident).join(',')}) values ${state.rows.map(row=>'('+cols.map(k=>bind(typeof row[k]==='object'&&row[k]!==null?JSON.stringify(row[k]):row[k])).join(',')+')').join(',')} returning *`;
          } else sql=`update ${tableName} set ${Object.entries(state.update).map(([k,v])=>`${ident(k)}=${bind(v)}`).join(',')}`;
          if(state.where.length)sql+=' where '+state.where.join(' and ');
          if(state.order)sql+=' order by '+state.order;
          if(state.operation==='update')sql+=' returning *';
          const r=await db.query(sql,state.values);return {data:single?r.rows[0]||null:r.rows,error:null};
        }catch(error){return {data:null,error};}
      }
      return builder;
    },
  };
}
